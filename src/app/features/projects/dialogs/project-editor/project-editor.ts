import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProjectDataSource } from '../../services';

@Component({
  selector: 'app-project-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './project-editor.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectEditor {
  private formBuilder = inject(FormBuilder);
  private projectDataSource = inject(ProjectDataSource);

  data = inject(MAT_DIALOG_DATA);

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
    name: ['', Validators.required],
    mode: [''],
    aperturaProg: [''],
    items: this.formBuilder.array([]),
    type: [''],
    descripcionAperturaProg: [''],
    price: [''],
    price_updated: [],
    reason: [''],
  });

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    const observable = this.data
      ? this.projectDataSource.update(this.data.id, this.formProcedure.value)
      : this.projectDataSource.create({
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
