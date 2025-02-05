import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  AutocompleteComponent,
  AutocompleteOption,
} from '../../../../../shared';
import { DocService } from '../../../../../communications/presentation/services';
import { Account } from '../../../../../administration/domain';
import { ProcurementService } from '../../../services';
import { procurementDoc } from '../../../../domain';

type validFormfield = 'sender' | 'recipient' | 'via';
type participantOptions = {
  [key in validFormfield]: AutocompleteOption<Account>[];
};

interface dialogData {
  document: procurementDoc;
  index: number;
  procurementId: string;
}

@Component({
  selector: 'app-doc-procurement-dialog',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    AutocompleteComponent,
  ],
  templateUrl: './doc-procurement-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    provideNativeDateAdapter(),
  ],
})
export class DocProcurementDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private docService = inject(DocService);
  private procurementService = inject(ProcurementService);
  private dialogRef = inject(MatDialogRef);

  data = inject<dialogData>(MAT_DIALOG_DATA);
  participants = signal<participantOptions>({
    recipient: [],
    sender: [],
    via: [],
  });

  formDoc: FormGroup = this._formBuilder.group({
    reference: [''],
    cite: [''],
    date: [new Date(), Validators.required],
    sender: this._formBuilder.group({
      fullname: [''],
      jobtitle: [''],
    }),
    recipient: this._formBuilder.group({
      fullname: [''],
      jobtitle: [''],
    }),
    via: this._formBuilder.group({
      fullname: [''],
      jobtitle: [''],
    }),
  });

  ngOnInit(): void {
    this.formDoc.patchValue(this.data.document);
  }

  save() {
    this.procurementService
      .updateDocuments(this.data.procurementId, {
        index: this.data.index,
        properties: this.formDoc.value,
      })
      .subscribe((docItem) => {
        this.dialogRef.close(docItem);
      });
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
}
