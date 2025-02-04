import {
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import {
  MatFormFieldModule,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material/form-field';

import { selectOption, SelectSearchComponent } from '../../../../../shared';
import { doc } from '../../../../../communications/infrastructure';

import { DocService } from '../../../../../communications/presentation/services';

import { ProcurementService } from '../../../services';

@Component({
  selector: 'app-procurement-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    SelectSearchComponent,
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

  readonly modes = [
    'Menor a 20 mil',
    '20 mil a 50 mil',
    'Mayor a 50 mil',
    'Mayor a 200 mil',
    'Mayor a 1 millon',
  ];

  readonly types = ['BIEN', 'SERVICIO'];

  readonly metodosAdjudicacion = [
    'Precio evaluado mas bajo',
    'Calidad, propuesta técnica y costo',
    'Calidad',
    'Selección de menor costo',
    'Selección de presupuesto fijo',
  ];

  readonly formasAdjudicacion = ['Por el total'];

  formProcedure: FormGroup = this.formBuilder.nonNullable.group({
    reference: ['', Validators.required],
    numberOfDocuments: ['', Validators.required],
    mode: [''],
    aperturaProg: [''],
    items: [''],
    type: [''],
    descripcionAperturaProg: [''],
    metodoAdjudicacion: [''],
    formaAdjudicacion: [''],
    price: [''],
    deliveryTimeframe: [''],
    deliveryLocation: [''],
    warranty: [''],
    reason: [''],
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
