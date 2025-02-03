import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';

import { selectOption, SelectSearchComponent } from '../../../../../shared';
import { doc } from '../../../../../communications/infrastructure';

import { DocService } from '../../../../../communications/presentation/services';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ProcurementService } from '../../../services';

@Component({
  selector: 'app-procurement-dialog',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    SelectSearchComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './procurement-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class ProcurementDialogComponent {
  private formBuilder = inject(FormBuilder);
  private documentService = inject(DocService);
  private precurementService = inject(ProcurementService);
  documents = signal<selectOption<doc>[]>([]);

  data: any = inject(MAT_DIALOG_DATA);

  selectedDocProps = signal<{ cite: string; docId: string } | null>(null);
  private dialogRef = inject(MatDialogRef);

  readonly types = [
    'Apoyo Nacional a la Produccion y Empleo',
    'Orden de compra y/o servicio modalidad contratacion menor',
    'Orden de compra y/o servicio modalidad contratacion menor (1 a 50 mil)',
    'Orden de compra y/o servicio modalidad contratacion menor (1 a 20 mil / Bienes)',
    'Orden de compra y/o servicio modalidad contratacion menor (1 a 20 mil / Servicios)',
    'Contratacion directa de proyectos especiales',
    'Contratacion por desastre o emergencias',
    'Contratacion de consultores en linea',
    'Excepcion, contratos en la modalidad de desastres y/o emegencias',
    'Empresas externas y municipales',
  ];

  formProcedure: FormGroup = this.formBuilder.nonNullable.group({
    numberOfDocuments: ['', Validators.required],
    reference: ['', Validators.required],
    tipo: [''],
  });

  save() {
    const observable = this.data
      ? this.precurementService.update(this.data._id, this.formProcedure.value)
      : this.precurementService.create({
          ...this.formProcedure.value,
          ...this.selectedDocProps(),
        });
    observable.subscribe((procedure) => this.dialogRef.close(procedure));
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
}
