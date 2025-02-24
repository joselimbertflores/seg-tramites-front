import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  ElementRef,
  ViewChild,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, filter, map, switchMap } from 'rxjs';

import { InboxService, SocketService } from '../../../services';
import { SimpleSelectSearchComponent } from '../../../components';
import { receiver } from '../../../../infraestructure/interfaces';
import { MaterialModule } from '../../../../material.module';
import { AlertService } from '../../../../shared';

export interface TransferDetails {
  id_mail?: string;
  code: string;
  id_procedure: string;
  attachmentQuantity: string;
}

interface SelectOption {
  value: string;
  text: string;
}

@Component({
  selector: 'submission-dialog',
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    SimpleSelectSearchComponent,
  ],
  templateUrl: './dispatcher.component.html',
  styleUrl: './dispatcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DispatcherComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DispatcherComponent>);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private inboxService = inject(InboxService);
  private socketService = inject(SocketService);

  public data: TransferDetails = inject(MAT_DIALOG_DATA);
  public institutions = signal<SelectOption[]>([]);
  public dependencies = signal<SelectOption[]>([]);

  public FormEnvio: FormGroup = this.fb.group({
    motivo: ['PARA SU ATENCION', Validators.required],
    cantidad: [this.data.attachmentQuantity, Validators.required],
    numero_interno: [''],
  });
  public receivers = signal<receiver[]>([]);
  public selectedReceivers = signal<receiver[]>([]);
  public filterReceiverCtrl = new FormControl('');
  public filteredReceivers$ = new BehaviorSubject<receiver[]>([]);
  @ViewChild('receiverInput') fruitInput!: ElementRef<HTMLInputElement>;

  constructor() {
    this.filterReceiverCtrl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((value) => typeof value === 'string')
      )
      .subscribe((term) => this._filter(term));
  }

  remove(id: string): void {
    this.selectedReceivers.update((values) =>
      values.filter((el) => el.id_account !== id)
    );
  }

  selected(user: receiver): void {
    this.fruitInput.nativeElement.value = '';
    this.filterReceiverCtrl.setValue('');
    const duplicante = this.selectedReceivers().some(
      (el) => el.id_account === user.id_account
    );
    if (duplicante) return;
    this.selectedReceivers.update((values) => [user, ...values]);
  }

  ngOnInit(): void {
    this.getInstitutions();
  }

  showConfirmSend() {
    this.alertService.QuestionAlert({
      title: `¿Remitir el tramite ${this.data.code}?`,
      text: `Numero de destinatarios: ${this.selectedReceivers().length}`,
      callback: () => {
        this.send();
      },
    });
  }

  send(): void {
    
    // this.inboxService
    //   .create(this.FormEnvio.value, this.data, this.selectedReceivers())
    //   .subscribe(() => {
    //     this.alertService.CloseLoadingAlert();
    //     this.dialogRef.close(true);
    //   });
  }

  getInstitutions() {
    this.dependencies.set([]);
    this.receivers.set([]);
    this.filteredReceivers$.next([]);
    // this.inboxService.getInstitucions().subscribe((resp) => {
    //   this.institutions.set(
    //     resp.map(({ _id, nombre }) => ({ value: _id, text: nombre }))
    //   );
    // });
  }

  getDependencies(id_institution: string) {
    this.receivers.set([]);
    this.filteredReceivers$.next([]);
    // this.inboxService
    //   .getDependenciesInInstitution(id_institution)
    //   .subscribe((data) => {
    //     this.dependencies.set(
    //       data.map(({ _id, nombre }) => ({ value: _id, text: nombre }))
    //     );
    //   });
  }

  getAccounts(id_dependency: string) {
    // this.inboxService
    //   .getAccountsForSend(id_dependency)
    //   .pipe(switchMap((receivers) => this._checkOnlineClients(receivers)))
    //   .subscribe((accounts) => {
    //     this.receivers.set(accounts);
    //     this.filteredReceivers$.next(accounts);
    //   });
  }

  get isValidForm() {
    return this.FormEnvio.valid && this.selectedReceivers().length > 0;
  }

  private _filter(value: string | null): void {
    if (!value) return this.filteredReceivers$.next(this.receivers());
    const filtered = this.receivers().filter(
      ({ officer: { fullname, jobtitle } }) =>
        fullname.toLowerCase().includes(value.toLowerCase()) ||
        jobtitle.toLowerCase().includes(value.toLowerCase())
    );
    this.filteredReceivers$.next(filtered);
  }

  private _checkOnlineClients(receivers: receiver[]): Observable<receiver[]> {
    return this.socketService.onlineClients$.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((clients) =>
        receivers.map((receiver) => {
          const isOnline = clients.some(
            ({ userId }) => userId === receiver.id_account
          );
          return { ...receiver, online: isOnline };
        })
      )
    );
  }
}
