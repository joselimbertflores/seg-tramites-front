import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import {
  AutocompleteOption,
  AutocompleteComponent,
} from '../../../../../shared';
import { Account } from '../../../../../administration/domain';
import { DocService } from '../../../services/doc.service';

type validFormfield = 'sender' | 'recipient' | 'via';
type participantOptions = {
  [key in validFormfield]: AutocompleteOption<Account>[];
};
@Component({
  selector: 'app-doc-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    AutocompleteComponent,
  ],
  templateUrl: './doc-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class DocDialogComponent {
  private _formBuilder = inject(FormBuilder);
  private docService = inject(DocService);
  private dialogRef = inject(MatDialogRef);

  readonly types = [
    { value: 'CI', label: 'COMUNICACION INTERNA' },
    { value: 'CE', label: 'COMUNICACION EXTERNA' },
    { value: 'CIR', label: 'CIRCULAR' },
    { value: 'MEM', label: 'MEMORANDUM' },
  ];

  data: any = inject(MAT_DIALOG_DATA);

  participants = signal<participantOptions>({
    sender: [],
    recipient: [],
    via: [],
  });

  showViaField = signal(false);

  formDoc: FormGroup = this._formBuilder.group({
    type: ['', Validators.required],
    reference: ['', Validators.required],
    sender: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
    recipient: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
    isGeneralCode: [false],
  });

  constructor() {
    effect(() => {
      this._toggleViaField();
    });
  }

  save() {
    const subscription = this.data
      ? this.docService.update(this.data.id, this.formDoc.value)
      : this.docService.create(this.formDoc.value);
    subscription.subscribe(() => this.dialogRef.close());
  }

  searchAccounts(field: validFormfield, term: string) {
    this.formDoc.get(`${field}.fullname`)?.setValue(term);
    if (!term) return;
    this.docService.searchAccounts(term).subscribe((data) => {
      const options: AutocompleteOption<Account>[] = data.map((option) => ({
        text: option.officer?.fullname ?? 'Desvinculado',
        value: option,
      }));
      this.participants.update((values) => ({ ...values, [field]: options }));
    });
  }

  onSelectAcount(path: validFormfield, account: Account): void {
    this.formDoc.get(path)?.patchValue({
      fullname: account.officer?.fullname,
      jobtitle: account.jobtitle,
    });
  }

  private _toggleViaField() {
    if (this.showViaField()) {
      this.formDoc.addControl(
        'via',
        this._formBuilder.group({
          fullname: ['', Validators.required],
          jobtitle: ['', Validators.required],
        })
      );
    } else {
      this.formDoc.removeControl('via');
    }
  }
}
