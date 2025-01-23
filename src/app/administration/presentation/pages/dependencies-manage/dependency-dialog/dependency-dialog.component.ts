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
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
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
    institucion: ['', Validators.required],
    areas: this._formBuilder.array([]),
  });

  public institutions = signal<SelectOption[]>([]);

  ngOnInit(): void {
    this._loadForm();
  }

  save() {
    const subscription = this.data
      ? this.dependencyService.update(this.data._id, this.FormDependency.value)
      : this.dependencyService.create(this.FormDependency.value);
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  addRequirement() {
    this.requeriments.push(
      this._formBuilder.group({
        name: ['', Validators.required],
        code: ['', Validators.required],
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

  private _loadForm() {
    if (this.data) {
      this.FormDependency.removeControl('institucion');
      this.data.areas?.forEach(() => this.addRequirement());
      this.FormDependency.patchValue(this.data);
    } else {
      this._getInstitutions();
    }
  }
}
