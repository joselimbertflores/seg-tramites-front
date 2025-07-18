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
import { toSignal } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { read, utils } from 'xlsx';

import { TypeProcedureService } from '../../services';
import { typeProcedure } from '../../../infrastructure';

interface excelData {
  nombre: string;
}
@Component({
  selector: 'app-type-procedure-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatCheckboxModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
  ],
  templateUrl: './type-procedure-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeProcedureDialogComponent {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TypeProcedureDialogComponent>);
  private typeService = inject(TypeProcedureService);

  data?: typeProcedure = inject(MAT_DIALOG_DATA);
  segments = toSignal(this.typeService.getSegments(), { initialValue: [] });

  typeProcedureForm: FormGroup = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    segmento: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10),
        Validators.pattern('^[A-Za-z0-9-]+$'),
      ],
    ],
    requerimientos: this.formBuilder.array([]),
    activo: [true],
  });

  filterTerm = signal<string>('');
  filteredSegments = computed(() => {
    const term = this.filterTerm().toLowerCase();
    return term
      ? this.segments().filter((option) => option.toLowerCase().includes(term))
      : this.segments();
  });

  ngOnInit(): void {
    this.loadForm();
  }

  save(): void {
    const subscription = this.data
      ? this.typeService.update(this.data._id, this.typeProcedureForm.value)
      : this.typeService.create(this.typeProcedureForm.value);
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  addRequirement(value?: string) {
    this.requeriments.push(
      this.formBuilder.group({
        nombre: [value ?? '', Validators.required],
        activo: true,
      })
    );
  }

  removeRequirement(index: number) {
    this.requeriments.removeAt(index);
  }

  loadExcel(event: Event): void {
    const inputElement = event.target as HTMLInputElement | undefined;
    if (!inputElement?.files) return;
    const file = inputElement.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const workbook = read(reader.result, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const data = utils
        .sheet_to_json<excelData>(workbook.Sheets[firstSheetName])
        .filter((item) => item.nombre);
      data.forEach((item) => this.addRequirement(item.nombre));
    };
    reader.readAsBinaryString(file);
  }

  get requeriments() {
    return this.typeProcedureForm.get('requerimientos') as FormArray;
  }

  private loadForm(): void {
    if (!this.data) return;
    this.typeProcedureForm.removeControl('segmento');
    this.data.requerimientos.forEach(() => this.addRequirement());
    this.typeProcedureForm.patchValue(this.data);
  }
}
