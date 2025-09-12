import { CommonModule } from '@angular/common';
import {
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormArray,
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { SelectSearchComponent, SelectSearchOption } from '../../../../shared';
import { DependencyService } from '../../services';
import { dependency } from '../../../infrastructure';

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
    MatIconModule,
    SelectSearchComponent,
  ],
  templateUrl: './dependency-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DependencyDialogComponent {
  private _formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DependencyDialogComponent>);
  private dependencyService = inject(DependencyService);

  data?: dependency = inject(MAT_DIALOG_DATA);
  institutions = signal<SelectSearchOption<string>[]>([]);

  public dependencyForm: FormGroup = this._formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    codigo: ['', Validators.required],
    institucion: ['', Validators.required],
    activo: [true],
    areas: this._formBuilder.array([]),
  });

  ngOnInit(): void {
    this.loadForm();
  }

  save() {
    const subscription = this.data
      ? this.dependencyService.update(this.data._id, this.dependencyForm.value)
      : this.dependencyService.create(this.dependencyForm.value);
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

  selectInstitution(id: string) {
    this.dependencyForm.get('institucion')?.setValue(id);
  }

  removeRequirement(index: number) {
    this.requeriments.removeAt(index);
  }

  get requeriments() {
    return this.dependencyForm.get('areas') as FormArray;
  }

  private getInstitutions() {
    this.dependencyService.getInstitutions().subscribe((options) => {
      this.institutions.set(options);
    });
  }

  private loadForm() {
    if (this.data) {
      this.dependencyForm.removeControl('institucion');
      this.data.areas?.forEach(() => this.addRequirement());
      this.dependencyForm.patchValue(this.data);
    } else {
      this.getInstitutions();
    }
  }
}
