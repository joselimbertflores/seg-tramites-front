import {
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
  OnInit,
  computed,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ProcurementService } from '../../../services';
import { ProcurementProcedure } from '../../../../domain';

@Component({
  selector: 'app-procurement-dialog',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatStepperModule,
    MatFormFieldModule,
  ],
  templateUrl: './procurement-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcurementDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private precurementService = inject(ProcurementService);

  data: ProcurementProcedure = inject(MAT_DIALOG_DATA);

  selectedDocProps = signal<{ cite: string; docId: string } | null>(null);
  private dialogRef = inject(MatDialogRef);

  readonly modes = ['OBRA', 'SERVICIO'];

  selectedMode = signal<string | null>(null);

  types = computed(() =>
    this.selectedMode() === 'OBRA'
      ? [
          'Contratacion menor: 1 a 50.000',
          'Contratación directa: 50.001 a 100.000',
          'ANPE: 100.000 a 1.000.000',
          'LP: Mayor a 1.000.000',
          'Contratación por excepcion',
        ]
      : ['Contratacion menor: Menor a 40.000', 'ANPE: Mayor a 40.000']
  );

  readonly metodosAdjudicacion = [
    'Precio evaluado mas bajo',
    'Calidad, propuesta técnica y costo',
    'Calidad',
    'Selección de menor costo',
    'Selección de presupuesto fijo',
  ];

  // TODO dinamic selection
  readonly documents = [
    { reference: 'SOLICITUD DE CERTIFICACION POA' },
    { reference: 'SOLICITUD DE CERTIFICACION PRESUPUESTARIA' },
    { reference: 'SOLICITUD DE INICIO DE CONTRATACION' },
  ];

  readonly formasAdjudicacion = ['Por el total'];

  formProcedure: FormGroup = this.formBuilder.nonNullable.group({
    reference: ['', Validators.required],
    numberOfDocuments: ['', Validators.required],
    mode: [''],
    aperturaProg: [''],
    items: this.formBuilder.array([]),
    type: [''],
    descripcionAperturaProg: [''],
    metodoAdjudicacion: [''],
    formaAdjudicacion: [''],
    price: [''],
    price_updated:[],
    deliveryTimeframe: [''],
    deliveryLocation: [''],
    warranty: [''],
    reason: [''],
  });

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    const observable = this.data
      ? this.precurementService.update(this.data.id, this.formProcedure.value)
      : this.precurementService.create({
          ...this.formProcedure.value,
          ...this.selectedDocProps(),
          documents: this.documents,
        });
    observable.subscribe((procedure) => this.dialogRef.close(procedure));
  }

  addRequirement() {
    this.requeriments.push(
      this.formBuilder.group({
        code: [''],
        name: [''],
        ff: [''],
        of: [''],
        amount: [''],
      })
    );
  }

  removeRequirement(index: number) {
    this.requeriments.removeAt(index);
  }

  get requeriments() {
    return this.formProcedure.get('items') as FormArray;
  }

  private loadForm(): void {
    if (!this.data) return;
    this.data.items.forEach(() => this.addRequirement());
    this.formProcedure.patchValue(this.data);
  }
}
