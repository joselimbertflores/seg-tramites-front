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
  SelectSearchComponent,
  AutocompleteOption,
  selectOption,
} from '../../../../../shared';

import { DocService } from '../../../../../communications/presentation/services';
import { InternalService } from '../../../services';
import { doc } from '../../../../../communications/infrastructure';
import { Account } from '../../../../../administration/domain';
import { InternalProcedure } from '../../../../domain';
import { ProfileService } from '../../../services/profile.service';

type validFormfield = 'sender' | 'recipient';
type participantOptions = {
  [key in validFormfield]: AutocompleteOption<Account>[];
};
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
  private dialogRef = inject(MatDialogRef);

  data: InternalProcedure = inject(MAT_DIALOG_DATA);
  officers = signal<participantOptions>({ sender: [], recipient: [] });
  documents = signal<selectOption<doc>[]>([]);

  formProcedure: FormGroup = this.formBuilder.nonNullable.group({
    numberOfDocuments: ['', Validators.required],
    reference: ['', Validators.required],
    sender: this.formBuilder.group({
      fullname: [this.account?.officer?.fullname, Validators.required],
      jobtitle: [this.account?.jobtitle, Validators.required],
    }),
    recipient: this.formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
  });

  selectedDocProps = signal<{ cite: string; docId: string } | null>(null);

  ngOnInit(): void {
    this._loadFormData();
  }

  save() {
    const observable = this.data
      ? this.internalService.update(this.data._id, this.formProcedure.value)
      : this.internalService.create({
          ...this.formProcedure.value,
          ...this.selectedDocProps(),
        });
    observable.subscribe((procedure) => this.dialogRef.close(procedure));
  }

  searchAccounts(field: validFormfield, term: string): void {
    this.formProcedure.get(`${field}.fullname`)?.setValue(term);
    if (!term) return;
    this.internalService.searchAccounts(term).subscribe((data) => {
      const options: AutocompleteOption<Account>[] = data.map((el) => ({
        text: el.officer?.fullname ?? 'Desvinculado',
        value: el,
      }));
      this.officers.update((values) => ({ ...values, [field]: options }));
    });
  }

  onSelectAcount(field: validFormfield, account: Account): void {
    this.formProcedure.get(`${field}`)?.patchValue({
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
      this.documents.set(options);
    });
  }

  onSelectDoc({ cite, _id, reference, sender, recipient }: doc) {
    this.formProcedure.patchValue({ cite, reference, sender, recipient });
    this.selectedDocProps.set({ docId: _id, cite });
  }

  private _loadFormData() {
    if (!this.data) return;
    this.formProcedure.patchValue(this.data);
  }
}
