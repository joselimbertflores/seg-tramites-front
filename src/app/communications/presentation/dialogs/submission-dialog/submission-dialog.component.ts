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
import { MatSelectModule } from '@angular/material/select';

import {
  distinctUntilChanged,
  BehaviorSubject,
  Observable,
  switchMap,
  debounce,
  filter,
  timer,
  map,
  of,
} from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { SocketService } from '../../../../layout/presentation/services';
import {
  AlertService,
  selectOption,
  SelectSearchComponent,
} from '../../../../shared';
import { InboxService, OutboxService } from '../../services';
import { Communication, onlineAccount, recipient } from '../../../domain';
import { doc } from '../../../infrastructure';

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
    MatChipsModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    NgxMatSelectSearchModule,
    SelectSearchComponent,
  ],
  template: `
    <h2 mat-dialog-title>Remision Tramite</h2>
    <mat-dialog-content>
      <div class="mb-6">
        <dl class="-my-3 divide-y divide-gray-200 text-sm">
          <div class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-4">
            <dt class="font-medium">Tramite:</dt>

            <dd class="sm:col-span-2">{{ data.procedure.code }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-4">
            <dt class="font-medium">Tipo:</dt>

            <dd class="sm:col-span-2">
              {{ data.isOriginal ? 'ORIGINAL' : 'COPIA' }}
            </dd>
          </div>
        </dl>
      </div>

      <form [formGroup]="formSubmission">
        <div class="grid grid-cols-3 gap-3 mt-2 mb-4">
          <div class="col-span-3">
            <mat-form-field>
              <mat-label>Instruccion / Proveido</mat-label>
              <textarea formControlName="reference" matInput required>
              </textarea>
              <mat-error *ngIf="formSubmission.controls['reference'].invalid">
                Ingrese el motivo
              </mat-error>
            </mat-form-field>
          </div>
          <div>
            <mat-form-field>
              <mat-label>Cantidad: hojas / anexos</mat-label>
              <input formControlName="attachmentsCount" matInput required />
              <mat-error
                *ngIf="formSubmission.controls['attachmentsCount'].invalid"
              >
                Ingrese la cantidad
              </mat-error>
            </mat-form-field>
          </div>
          <div>
            <mat-form-field>
              <mat-label>Numero de registro interno</mat-label>
              <input formControlName="internalNumber" matInput />
            </mat-form-field>
          </div>
          <div>
            <mat-form-field>
              <mat-label>Prioridad</mat-label>
              <mat-select formControlName="priority">
                @for (item of prioritys; track $index) {
                <mat-option [value]="item.value">
                  {{ item.label }}
                </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </form>
      <div class="flex flex-col sm:flex-row gap-x-2">
        <div class="sm:w-1/3">
          <select-search
            title="Institucion (Opcional)"
            placeholder="Seleccione una institucion"
            [items]="institutions()"
            (onSelect)="getDependencies($event)"
          />
        </div>
        <div class="sm:w-2/3">
          <select-search
            title="Dependencia (Opcional)"
            placeholder="Seleccione una dependencia"
            [nullable]="true"
            [items]="dependencies()"
            (onSelect)="getRecipientsByDependency($event)"
          />
        </div>
      </div>
      <mat-form-field>
        <mat-label>Destinatarios</mat-label>
        <mat-chip-grid #chipGrid aria-label="User selection">
          @for (fruit of selectedReceivers(); track $index) {
          <mat-chip-row
            (removed)="removeRecipient(fruit.id)"
            [ngStyle]="
              fruit.isOriginal && {
                'background-color': 'var(--mat-sys-primary-container)'
              }
            "
          >
            <img
              matChipAvatar
              src="images/icons/account.png"
              alt="Photo of officer"
            />
            {{ fruit.fullname | titlecase }}

            <button
              matChipRemove
              [attr.aria-label]="'remove ' + fruit.id"
              (click)="removeRecipient(fruit)"
            >
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
          }
        </mat-chip-grid>
        <input
          placeholder="Buscar destinatario"
          #receiverInput
          [formControl]="filterRecipientCtrl"
          [matChipInputFor]="chipGrid"
          [matAutocomplete]="auto"
        />
        <mat-autocomplete
          #auto="matAutocomplete"
          (optionSelected)="selectRecipient($event); receiverInput.value = ''"
        >
          @for (user of filteredReceivers$ | async; track user.id) {
          <mat-option [value]="user">
            <div class="flex gap-x-3 items-center relative">
              <div class="relative">
                <img
                  class="h-6 w-6 rounded-full"
                  src="images/icons/account.png"
                />
                <span
                  class="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                  [ngClass]="{
                    'bg-green-500': user.online,
                    'bg-gray-400': !user.online
                  }"
                >
                </span>
              </div>
              <div class="flex flex-col">
                <span>{{ user.fullname | titlecase }}</span>
                <small>{{ user.jobtitle }}</small>
              </div>
            </div>
          </mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" mat-dialog-close>Cancelar</button>
      <button
        mat-button
        color="primary"
        [disabled]="!isFormValid()"
        (click)="showConfirmSend()"
      >
        Remitir
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
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
    reference: ['', Validators.required],
    attachmentsCount: [this.data.attachmentsCount, Validators.required],
    internalNumber: [''],
    priority:[0, Validators.required]
  });
  recipients = signal<recipient[]>([]);

  filterRecipientCtrl = new FormControl<string>('', { nonNullable: true });
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

  readonly prioritys = [
    { value: 0, label: 'Normal' },
    { value: 1, label: 'Urgente' },
  ];

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
      this.selectedReceivers.set([{ ...user, isOriginal: false }]);
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
      .subscribe((communications) =>
        this.dialogRef.close({ data: communications })
      );
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
      .pipe(map((accounts) => this.checkOnlineAccounts(accounts)));
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
