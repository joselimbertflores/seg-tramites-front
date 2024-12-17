import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { Observable, map, startWith } from 'rxjs';
import { read, utils } from 'xlsx';

import { TypeProcedureService } from '../../../services';
import { typeProcedure } from '../../../../infrastructure';

interface excelData {
  nombre: string;
}
@Component({
    selector: 'app-type-procedure',
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatSelectModule,
    ],
    templateUrl: './type-procedure.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class TypeProcedureComponent {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TypeProcedureComponent>);
  private typeService = inject(TypeProcedureService);
  private destroy = inject(DestroyRef);

  public data?: typeProcedure = inject(MAT_DIALOG_DATA);
  public segments = signal<string[]>([]);

  formTypeProcedure: FormGroup = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    segmento: ['', Validators.required],
    tipo: ['', Validators.required],
    requerimientos: this.formBuilder.array([]),
    activo: [true],
  });

  filteredSegments: Observable<string[]>;

  ngOnInit(): void {
    this._gerRequiredProps();
    this._loadForm();
  }

  save(): void {
    const subscription = this.data
      ? this.typeService.update(this.data._id, this.formTypeProcedure.value)
      : this.typeService.create(this.formTypeProcedure.value);
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
    return this.formTypeProcedure.get('requerimientos') as FormArray;
  }

  private _loadForm(): void {
    if (!this.data) return;
    this.formTypeProcedure.removeControl('tipo');
    this.formTypeProcedure.removeControl('segmento');

    this.data.requerimientos.forEach(() => this.addRequirement());
    this.formTypeProcedure.patchValue(this.data);
  }

  private _gerRequiredProps(): void {
    this.typeService.getSegments().subscribe((segments) => {
      this.segments.set(segments);
      this._setAutocomplete();
    });
  }

  private _setAutocomplete(): void {
    const control = this.formTypeProcedure.get('segmento');
    if (!control) return;
    this.filteredSegments = control.valueChanges.pipe(
      takeUntilDestroyed(this.destroy),
      startWith(''),
      map((value) => (value ? this._filterSegments(value) : this.segments()))
    );
  }

  private _filterSegments(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.segments().filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
}
