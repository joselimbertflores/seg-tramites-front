import {
  ChangeDetectionStrategy,
  Component,
  effect,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import {
  AutocompleteComponent,
  AutocompleteOption,
} from '../../../../../shared';
import { DocService } from '../../../../../communications/presentation/services';
import { Account } from '../../../../../administration/domain';
import { ProcurementService, ProfileService } from '../../../services';
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
    MatCheckboxModule,
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
  private account = inject(ProfileService).account();

  data = inject<dialogData>(MAT_DIALOG_DATA);
  participants = signal<participantOptions>({
    recipient: [],
    sender: [],
    via: [],
  });
  showViaField = signal(false);

  formDoc: FormGroup = this._formBuilder.group({
    reference: ['', Validators.required],
    cite: [this.account?.dependencia.codigo, Validators.required],
    date: [new Date(), Validators.required],
    sender: this._formBuilder.group({
      fullname: [this.account?.officer?.fullName, Validators.required],
      jobtitle: [this.account?.jobtitle, Validators.required],
    }),
    recipient: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      this._toggleViaField();
    });
  }

  ngOnInit(): void {
    this._loadForm();
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
        text: option.officer?.fullName ?? 'Desvinculado',
        value: option,
      }));
      this.participants.update((values) => ({ ...values, [field]: options }));
    });
  }

  onSelectAcount(path: validFormfield, account: Account): void {
    this.formDoc.get(path)?.patchValue({
      fullname: account.officer?.fullName,
      jobtitle: account.jobtitle,
    });
  }

  private _toggleViaField() {
    if (this.showViaField()) {
      const { fullname = '', jobtitle = '' } = this.data.document.via ?? {};
      this.formDoc.addControl(
        'via',
        this._formBuilder.group({
          fullname: [fullname, Validators.required],
          jobtitle: [jobtitle, Validators.required],
        })
      );
    } else {
      this.formDoc.removeControl('via');
    }
  }

  private _loadForm() {
    if (this.data.document.via) this.showViaField.set(true);
    this.formDoc.patchValue(this.data.document);
  }
}
