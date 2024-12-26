import { CommonModule } from '@angular/common';
import {
  OnInit,
  inject,
  signal,
  effect,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  Validators,
  FormGroup,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import {
  distinctUntilChanged,
  BehaviorSubject,
  switchMap,
  debounce,
  timer,
  map,
} from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { selectOption, SelectSearchComponent } from '../../../../../shared';
import {
  AlertService,
  SocketService,
  CommunicationService,
} from '../../../../../presentation/services';
import { doc } from '../../../../infrastructure';
import { DocService } from '../../../services';
import {
  onlineAccount,
  recipient,
  submissionDialogData,
} from '../../../../domain';
@Component({
  selector: 'submission-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatStepperModule,
    NgxMatSelectSearchModule,
    SelectSearchComponent,
  ],
  templateUrl: './submission-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class SubmissionDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef);

  private inboxService = inject(CommunicationService);
  private documentService = inject(DocService);
  private alertService = inject(AlertService);
  private socketService = inject(SocketService);

  data: submissionDialogData = inject(MAT_DIALOG_DATA);

  formSubmission: FormGroup = this.formBuilder.group({
    reference: ['PARA SU ATENCION', Validators.required],
    attachmentsCount: [this.data.attachmentsCount, Validators.required],
    internalNumber: [this._getInternalNumber()],
  });

  accounts = signal<onlineAccount[]>([]);
  recipients = signal<recipient[]>([]);
  documents = signal<selectOption<doc>[]>([]);
  institutions = toSignal(this.inboxService.getInstitucions(), {
    initialValue: [],
  });
  dependencies = signal<selectOption<string>[]>([]);
  dependencyId = signal<string | null>(null);

  public filterReceiverCtrl = new FormControl<string>('');
  public bankServerSideCtrl = new FormControl<onlineAccount | null>(null);
  public filteredReceivers$ = new BehaviorSubject<onlineAccount[]>([]);

  isCopyButtonEnabled = computed<boolean>(() => {
    if (this.data.isOriginal) {
      if (this.data.isResend === false) {
        return true;
      }
      return this.recipients().some(({ isOriginal }) => isOriginal);
    }
    return this.recipients().length === 0;
  });

  isOriginalButtonEnabled = computed<boolean>(() => {
    return (
      this.data.isOriginal &&
      !this.recipients().some(({ isOriginal }) => isOriginal) &&
      (this.data.isResend ?? true)
    );
  });

  isFormValid = computed<boolean>(() => {
    const hasValidRecipients = this.data.isOriginal
      ? this.recipients().some(({ isOriginal }) => isOriginal)
      : this.recipients().every(({ isOriginal }) => !isOriginal);
    return (
      this.formSubmission.valid &&
      this.recipients().length > 0 &&
      hasValidRecipients
    );
  });

  constructor() {
    effect(() => {
      this.filteredReceivers$.next(this.accounts());
    });
  }

  ngOnInit(): void {
    this._setFilterControl();
  }

  showConfirmSend(): void {
    this.alertService
      .confirmDialog({
        title: `¿Confirmar Remision?`,
        description: `Se remitira el tramite ${this.data.procedure.code}`,
      })
      .subscribe((result) => {
        if (result) {
          this.send();
        }
      });
  }

  send(): void {
    this.inboxService
      .create({
        form: this.formSubmission.value,
        communicationId: this.data.communicationId,
        procedureId: this.data.procedure.id,
        recipients: this.recipients(),
      })
      .subscribe((communications) => {
        this.dialogRef.close(communications);
      });
  }

  add(isOriginal: boolean): void {
    const controlValue = this.bankServerSideCtrl.value;
    if (!controlValue) return;

    const newReceiver = { ...controlValue, isOriginal };

    // * Si envio actual es es original
    if (this.data.isOriginal) {
      if (this.recipients().filter(({ isOriginal }) => isOriginal).length > 1) {
        // * Si se quiere agregar un original
        return;
      }
      const duplicante = this.recipients().some(
        ({ id }) => id === newReceiver.id
      );
      if (duplicante) return;
      this.recipients.update((values) => [...values, newReceiver]);
    } else {
      // * Si envio actual es copia
      if (isOriginal || this.recipients().length >= 1) {
        // * No se puede derivar el original como una copia y solo 1
        return;
      }
      this.recipients.set([newReceiver]);
    }
    this.bankServerSideCtrl.setValue(null);
  }

  remove(id: string): void {
    this.recipients.update((values) => values.filter((el) => el.id !== id));
  }

  getDependencies(institutionId: string) {
    this.accounts.set([]);
    this.dependencyId.set(null);
    this.inboxService
      .getDependenciesInInstitution(institutionId)
      .subscribe((data) => this.dependencies.set(data));
  }

  getRecipientsByDependency(dependencyId: string | null): void {
    this.dependencyId.set(dependencyId);
    if (!dependencyId) {
      this.accounts.set([]);
      return;
    }
    this.inboxService
      .searchRecipientsAccounts(dependencyId)
      .pipe(switchMap((receivers) => this._checkOnlineAccounts(receivers)))
      .subscribe((accounts) => this.accounts.set(accounts));
  }

  searchDocuments(term: string) {
    if (!term) return;
    this.documentService.searchPendingDocs(term).subscribe((data) => {
      const options: selectOption<doc>[] = data.map((item) => ({
        label: `${item.cite} - ${item.reference}`,
        value: item,
      }));
      this.documents.set(options);
    });
  }

  onSelectDoc({ correlative }: doc) {
    this.formSubmission.patchValue({ internalNumber: correlative });
  }

  private _setFilterControl(): void {
    this.filterReceiverCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        debounce(() => timer(this.dependencyId() ? 0 : 350))
      )
      .subscribe((term) => {
        this._filterRecipients(term);
      });
  }

  private _filterRecipients(term: string | null): void {
    if (!this.dependencyId()) {
      if (!term) return;
      this.inboxService
        .searchRecipientsAccounts(term)
        .pipe(switchMap((receivers) => this._checkOnlineAccounts(receivers)))
        .subscribe((recipients) => this.accounts.set(recipients));
    } else {
      const options: onlineAccount[] = term
        ? this.accounts().filter(({ fullname }) =>
            fullname.toLowerCase().includes(term.toLowerCase())
          )
        : this.accounts();

      this.filteredReceivers$.next(options);
    }
  }

  private _checkOnlineAccounts(accounts: onlineAccount[]) {
    return this.socketService.onlineClients$.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((clients) =>
        accounts.map((receiver) => ({
          ...receiver,
          online: clients.some(({ userId }) => userId === receiver.userId),
        }))
      )
    );
  }

  private _getInternalNumber(): string {
    return this.data.cite?.split('/')[3] ?? '';
  }
}
