import { CommonModule } from '@angular/common';
import { inject, Component, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { InstitutionService } from '../../services';
import { institution } from '../../../infrastructure';

@Component({
  selector: 'app-institution-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './institution-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstitutionDialogComponent {
  private formBuilder = inject(FormBuilder);
  private institutionService = inject(InstitutionService);
  private dialogRef = inject(MatDialogRef);

  data = inject<institution | undefined>(MAT_DIALOG_DATA);
  institutionForm: FormGroup = this.formBuilder.group({
    nombre: ['', Validators.required],
    sigla: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z0-9-]+$/),
      ],
    ],
    activo: [true],
  });

  ngOnInit(): void {
    this.institutionForm.patchValue(this.data ?? {});
  }

  save() {
    const subscription = this.data
      ? this.institutionService.update(
          this.data._id,
          this.institutionForm.value
        )
      : this.institutionService.create(this.institutionForm.value);
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }
}
