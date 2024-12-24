import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  OnInit,
  inject,
  signal,
  effect,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
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
  CommunicationService,
  recipient,
  onlineAccount,
  SocketService,
} from '../../../../../presentation/services';
import { StatusMail } from '../../../../../domain/models';
import { DocService } from '../../../services';
import { doc } from '../../../../infrastructure';

export interface TransferDetails {
  communication?: communicationProps;
  procedure: procedureProps;
  attachmentsCount: string;
  isOriginal: boolean;
}
interface communicationProps {
  id: string;
  status: StatusMail;
}
interface procedureProps {
  id: string;
  code: string;
}

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
  private dialogRef = inject(MatDialogRef);
  private destroyRef = inject(DestroyRef);

  private inboxService = inject(CommunicationService);
  private documentService = inject(DocService);
  private alertService = inject(AlertService);
  private socketService = inject(SocketService);

  data: TransferDetails = inject(MAT_DIALOG_DATA);
  institutions = toSignal(this.inboxService.getInstitucions(), {
    initialValue: [],
  });
  dependencies = signal<selectOption<string>[]>([]);

  formSubmission: FormGroup = this.formBuilder.group({
    reference: ['PARA SU ATENCION', Validators.required],
    attachmentsCount: [this.data.attachmentsCount, Validators.required],
    internalNumber: [''],
  });

  accounts = signal<onlineAccount[]>([]);
  recipients = signal<recipient[]>([]);
  dependencyId = signal<string | null>(null);
  isFormPosting = signal<boolean>(false);
  documents = signal<selectOption<doc>[]>([]);

  public filterReceiverCtrl = new FormControl<string>('');
  public bankServerSideCtrl = new FormControl<onlineAccount | null>(null);
  public filteredReceivers$ = new BehaviorSubject<onlineAccount[]>([]);

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
    this.isFormPosting.set(true);
    this.inboxService
      .create({
        form: this.formSubmission.value,
        mailId: this.data.communication?.id,
        procedureId: this.data.procedure.id,
        recipients: this.recipients(),
      })
      .subscribe((communications) => {
        this.dialogRef.close(communications);
        this.isFormPosting.set(false);
      });
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
      .searchRecipients(dependencyId)
      .pipe(switchMap((receivers) => this._checkOnlineAccounts(receivers)))
      .subscribe((accounts) => this.accounts.set(accounts));
  }

  add(isOriginal: boolean): void {
    const receiver = this.bankServerSideCtrl.value;
    if (!receiver) return;
    if (this.data.isOriginal) {
      if (isOriginal) {
        const hasOriginal = this.recipients().some(
          ({ isOriginal }) => isOriginal
        );
        if (hasOriginal) {
          console.log('ya hay un original');
          return;
        }
      }
      const duplicante = this.recipients().some(
        ({ accountId }) => accountId === receiver.accountId
      );
      if (duplicante) {
        console.log('receptor duplicadno');
        return;
      }
      this.recipients.update((values) => [
        ...values,
        {
          accountId: receiver.accountId,
          jobtitle: receiver.jobtitle,
          fullname: receiver.officer.fullname,
          isOriginal,
        },
      ]);
    } else {
      if (isOriginal) {
        console.log('no se puede derivar el original como una copia');
        return;
      }
      const { officer, jobtitle, accountId } = receiver;
      this.recipients.set([
        { fullname: officer.fullname, jobtitle, accountId, isOriginal: false },
      ]);
    }
    this.bankServerSideCtrl.setValue(null);
  }

  remove(id: string): void {
    this.recipients.update((values) =>
      values.filter((el) => el.accountId !== id)
    );
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

  get isFormValid(): boolean {
    if (!this.data.isOriginal) {
      return (
        this.formSubmission.valid &&
        this.recipients().length > 0 &&
        this.recipients().length <= 1 &&
        this.recipients().every(({ isOriginal }) => !isOriginal)
      );
    }
    if (this.data.communication?.status === StatusMail.Pending) {
      return (
        this.formSubmission.valid &&
        this.recipients().length > 0 &&
        this.recipients().every(({ isOriginal }) => !isOriginal)
      );
    }
    return (
      this.formSubmission.valid &&
      this.recipients().length > 0 &&
      this.recipients().some(({ isOriginal }) => isOriginal)
    );
  }

  get isAddEnabled(): boolean {
    if (this.data.isOriginal) {
      if (this.data.communication?.status === StatusMail.Pending) return false;
      return this.recipients().every(({ isOriginal }) => !isOriginal);
    }
    return true;
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
        .searchRecipients(term)
        .pipe(switchMap((receivers) => this._checkOnlineAccounts(receivers)))
        .subscribe((recipients) => this.accounts.set(recipients));
    } else {
      const options: onlineAccount[] = term
        ? this.accounts().filter(({ officer }) =>
            officer.fullname.toLowerCase().includes(term.toLowerCase())
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
}
