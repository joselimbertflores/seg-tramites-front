import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  OnInit,
  inject,
  signal,
  effect,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
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

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import {
  distinctUntilChanged,
  BehaviorSubject,
  switchMap,
  debounce,
  timer,
  map,
  filter,
  Observable,
  of,
} from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import {
  AlertService,
  selectOption,
  SelectSearchComponent,
} from '../../../../../shared';

import { doc } from '../../../../infrastructure';
import { InboxService, OutboxService } from '../../../services';
import { Communication, onlineAccount, recipient } from '../../../../domain';
import { SocketService } from '../../../../../layout/presentation/services';

export interface submissionResult {
  error?: string;
  data?: Communication[];
}
export interface submissionData {
  communicationId?: string;
  attachmentsCount: string;
  isOriginal: boolean;
  procedure: procedureProps;
  cite?: string;
  isResend?: boolean;
  mode: communicationMode;
}
interface procedureProps {
  id: string;
  code: string;
}

export type communicationMode = 'initiate' | 'forward' | 'resend';
@Component({
  selector: 'submission-dialog',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    NgxMatSelectSearchModule,
    SelectSearchComponent,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatChipsModule,
  ],
  templateUrl: './submission-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// 3780
export class SubmissionDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialogRef: MatDialogRef<SubmissionDialogComponent, submissionResult> =
    inject(MatDialogRef);
  private inboxService = inject(InboxService);
  private alertService = inject(AlertService);
  private socketService = inject(SocketService);
  private outboxService = inject(OutboxService);

  data: submissionData = inject(MAT_DIALOG_DATA);
  accounts = signal<onlineAccount[]>([]);
  documents = signal<selectOption<doc>[]>([]);
  institutions = toSignal(this.inboxService.getInstitucions(), {
    initialValue: [],
  });
  dependencies = signal<selectOption<string>[]>([]);
  dependencyId = signal<string | null>(null);

  formSubmission: FormGroup = this._formBuilder.group({
    reference: ['PARA SU ATENCION', Validators.required],
    attachmentsCount: [this.data.attachmentsCount, Validators.required],
    internalNumber: [''],
  });
  recipients = signal<recipient[]>([]);

  filterRecipientCtrl = new FormControl<string>('', { nonNullable: true });
  bankServerSideCtrl = new FormControl<onlineAccount | null>(null);
  filteredReceivers$ = new BehaviorSubject<onlineAccount[]>([]);

  isCopyEnabled = computed<boolean>(() => {
    if (this.data.isResend) return true;
    if (!this.data.isOriginal) return this.recipients().length === 0;
    return this.recipients().some(({ isOriginal }) => isOriginal);
  });

  isOriginalEnabled = computed<boolean>(() => {
    if (this.data.isResend || !this.data.isOriginal) return false;
    return this.recipients().every(({ isOriginal }) => !isOriginal);
  });

  isFormValid = computed<boolean>(() => {
    if (this.data.isResend) {
      return this.formSubmission.valid && this.selectedReceivers().length >= 1;
    }
    return this.formSubmission.valid && this.data.isOriginal
      ? this.selectedReceivers().some(({ isOriginal }) => isOriginal)
      : this.selectedReceivers().length === 1;
  });

  public selectedReceivers = signal<any[]>([]);

  constructor() {
    effect(() => {
      console.log('effect accounts');
      this.filteredReceivers$.next(this.accounts());
    });
  }

  ngOnInit(): void {
    this.setFilterRecipientsControl();
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

  selectRecipient(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value;
    this.filterRecipientCtrl.setValue('');
    event.option.deselect();

    if (this.selectedReceivers().some(({ id }) => id === user.id)) return;

    if (this.data.isOriginal) {
      if (this.data.isResend) {
        this.selectedReceivers.update((values) => [
          ...values,
          { ...user, isOriginal: false },
        ]);
      } else {
        this.selectedReceivers.update((values) => {
          const hasOriginal = values.some(({ isOriginal }) => isOriginal);
          return [
            ...values,
            { ...user, isOriginal: hasOriginal ? false : true },
          ];
        });
      }
    } else {
      this.selectedReceivers.set([{ ...user, is: false }]);
    }
  }

  removeRecipient(user: recipient): void {
    this.selectedReceivers.update((values) =>
      values.filter(({ id }) => id !== user.id)
    );
  }

  send(): void {
    this.outboxService
      .create(
        {
          ...this.formSubmission.value,
          communicationId: this.data.communicationId,
          procedureId: this.data.procedure.id,
          recipients: this.selectedReceivers().map(({ id, isOriginal }) => ({
            accountId: id,
            isOriginal,
          })),
        },
        this.data.mode
      )
      .subscribe({
        next: (result) => {
          this.dialogRef.close({ data: result });
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse && err.status === 410) {
            this.alertService
              .messageDialog({
                title: 'Envio actual expirado',
                description:
                  'La comunicacion actual ha expirado. Vuelva a remitir el tramite',
              })
              .subscribe();
            this.dialogRef.close({ error: 'expired' });
          }
        },
      });
  }

  getDependencies(institutionId: string) {
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
      .pipe(map((accounts) => this.checkOnlineAccounts(accounts)))
      .subscribe((accounts) => this.accounts.set(accounts));
  }

  private setFilterRecipientsControl(): void {
    this.filterRecipientCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        debounce(() => timer(this.dependencyId() ? 0 : 350)),
        filter((value) => {
          const isString = typeof value === 'string';
          // * for filter in backend, term should not be empty
          return isString && (!!this.dependencyId() || value.trim().length > 0);
        }),
        switchMap((term) => {
          return this.dependencyId()
            ? this.filterLocalAccounts(term)
            : this.filterServerAccount(term);
        })
      )
      .subscribe((recipients) => this.filteredReceivers$.next(recipients));
  }

  private filterLocalAccounts(term: string): Observable<onlineAccount[]> {
    const lowerTerm = term.toLowerCase();
    const options = lowerTerm
      ? this.accounts().filter(({ fullname, jobtitle }) =>
          [fullname, jobtitle].some((field) =>
            field.toLowerCase().includes(lowerTerm)
          )
        )
      : this.accounts();
    return of(options);
  }

  private filterServerAccount(term: string): Observable<onlineAccount[]> {
    if (!term) return of([]);
    return this.inboxService
      .searchRecipientsAccounts(term)
      .pipe(map((recipients) => this.checkOnlineAccounts(recipients)));
  }

  private checkOnlineAccounts(accounts: onlineAccount[]) {
    return accounts.map((receiver) => ({
      ...receiver,
      online: this.socketService.currentOnlineUsers.some(
        ({ userId }) => userId === receiver.userId
      ),
    }));
  }
}
