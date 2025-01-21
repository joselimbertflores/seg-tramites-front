import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { SimpleSelectSearchComponent } from '../../../../../shared';
import { DependencyService } from '../../../services';
import { dependency } from '../../../../infrastructure';
import { MatIconModule } from '@angular/material/icon';

interface SelectOption {
  text: string;
  value: string;
}
@Component({
  selector: 'app-dependency-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    SimpleSelectSearchComponent,
    MatIconModule,
  ],
  templateUrl: './dependency-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
})
export class DependencyDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DependencyDialogComponent>);
  private dependencyService = inject(DependencyService);
  data?: dependency = inject(MAT_DIALOG_DATA);

  public FormDependency: FormGroup = this._formBuilder.group({
    nombre: ['', Validators.required],
    codigo: ['', Validators.required],
    sigla: ['', [Validators.required, Validators.maxLength(10)]],
    institucion: ['', Validators.required],
    activo: [true],
    areas: this._formBuilder.array([]),
  });

  public institutions = signal<SelectOption[]>([]);

  ngOnInit(): void {
    if (this.data) {
      this.FormDependency.removeControl('institucion');
      this.FormDependency.patchValue(this.data);
    } else {
      this._getInstitutions();
    }
  }

  save() {
    const subscription = this.data
      ? this.dependencyService.edit(this.data._id, this.FormDependency.value)
      : this.dependencyService.add(this.FormDependency.value);
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  addRequirement(value?: string) {
    this.requeriments.push(
      this._formBuilder.group({
        nombre: [value ?? '', Validators.required],
        activo: true,
      })
    );
  }

  selectInstitution(id?: string) {
    this.FormDependency.get('institucion')?.setValue(id ?? '');
  }

  removeRequirement(index: number) {
    this.requeriments.removeAt(index);
  }

  get requeriments() {
    return this.FormDependency.get('areas') as FormArray;
  }

  private _getInstitutions() {
    this.dependencyService.getInstitutions().subscribe((resp) => {
      this.institutions.set(
        resp.map((el) => ({ value: el._id, text: el.nombre }))
      );
    });
  }
}
