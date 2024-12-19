import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
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
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import {
  AutocompleteComponent,
  AutocompleteOption,
  selectOption,
  SelectSearchComponent,
} from '../../../../../shared';

import { DocService } from '../../../../../communications/presentation/services';
import { doc } from '../../../../../communications/infrastructure';
import { InternalService, ProfileService } from '../../../services';
import { Account } from '../../../../../administration/domain';
import { InternalProcedure } from '../../../../domain';

interface workers {
  emitter: AutocompleteOption<Account>[];
  receiver: AutocompleteOption<Account>[];
}
@Component({
  selector: 'app-internal-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    AutocompleteComponent,
    SelectSearchComponent,
  ],
  templateUrl: './internal-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class InternalDialogComponent {
  private account = inject(ProfileService).account();
  private internalService = inject(InternalService);
  private documentService = inject(DocService);
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<InternalDialogComponent>);

  public data: InternalProcedure = inject(MAT_DIALOG_DATA);

  officers = signal<workers>({ emitter: [], receiver: [] });
  documents = signal<selectOption<doc>[]>([]);

  formProcedure: FormGroup = this.formBuilder.nonNullable.group({
    numberOfDocuments: ['', Validators.required],
    reference: ['', Validators.required],
    cite: [this.account?.dependencia.codigo],
    emitter: this.formBuilder.group({
      fullname: [this.account?.officer?.fullname, Validators.required],
      jobtitle: [this.account?.jobtitle, Validators.required],
    }),
    receiver: this.formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
  });

  ngOnInit(): void {
    this._loadFormData();
  }

  save() {
    const observable = this.data
      ? this.internalService.update(this.data._id, this.formProcedure.value)
      : this.internalService.create(this.formProcedure.value);
    observable.subscribe((procedure) => this.dialogRef.close(procedure));
  }

  searchAccounts(worker: 'emitter' | 'receiver', term: string): void {
    this.formProcedure.get(`${worker}.fullname`)?.setValue(term);
    if (!term) return;
    this.internalService.searchAccounts(term).subscribe((data) => {
      const options: AutocompleteOption<Account>[] = data.map((el) => ({
        text: el.officer?.fullname ?? 'Desvinculado',
        value: el,
      }));
      this.officers.update((values) => ({ ...values, [worker]: options }));
    });
  }

  selectAcount(worker: 'emitter' | 'receiver', account: Account): void {
    this.formProcedure.get(`${worker}`)?.patchValue({
      fullname: account.officer?.fullname,
      jobtitle: account.jobtitle,
    });
  }

  searchDocuments(term: string) {
    if (!term) return;
    this.documentService.searchPendingDocs(term).subscribe((data) => {
      const options: selectOption<doc>[] = data.map((item) => ({
        label: `${item.cite} - ${item.reference}`,
        value: item,
      }));
      console.log(options);
      this.documents.set(options);
    });
  }

  private _loadFormData() {
    if (!this.data) return;
    this.formProcedure.patchValue(this.data);
  }
}
