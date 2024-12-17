import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { SimpleSelectSearchComponent } from '../../../../../shared';
import { DependencyService } from '../../../services';
import { dependency } from '../../../../infrastructure';

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
    ],
    templateUrl: './dependency-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DependencyDialogComponent>);
  private dependencyService = inject(DependencyService);
  data?: dependency = inject(MAT_DIALOG_DATA);

  public FormDependency: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    codigo: ['', Validators.required],
    sigla: ['', [Validators.required, Validators.maxLength(10)]],
    institucion: ['', Validators.required],
    activo: [true],
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

  selectInstitution(id?: string) {
    this.FormDependency.get('institucion')?.setValue(id ?? '');
  }

  private _getInstitutions() {
    this.dependencyService.getInstitutions().subscribe((resp) => {
      this.institutions.set(
        resp.map((el) => ({ value: el._id, text: el.nombre }))
      );
    });
  }
}
