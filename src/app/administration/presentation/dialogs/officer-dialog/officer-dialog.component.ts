import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import {
  FormErrorMessagesPipe,
  FieldValidationErrorMessages,
} from '../../../../shared';
import { OfficerService } from '../../services';
import { Officer } from '../../../domain';

@Component({
  selector: 'app-officer-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    FormErrorMessagesPipe,
  ],
  templateUrl: './officer-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficerDialogComponent {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private officerService = inject(OfficerService);

  data: Officer | undefined = inject(MAT_DIALOG_DATA);
  officerForm: FormGroup = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    paterno: ['', Validators.required],
    materno: [''],
    email: ['', Validators.email],
    dni: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9-]+$'),
        Validators.minLength(5),
        Validators.maxLength(12),
      ],
    ],
    activo: [true],
    telefono: ['', Validators.pattern('^[0-9]*$')],
  });

  protected errorMessages: FieldValidationErrorMessages = {
    dni: {
      pattern: 'No se permiten caracteres especiales',
    },
    telefono: {
      pattern: 'Solo se permiten numeros',
    },
  };

  ngOnInit(): void {
    this.officerForm.patchValue(this.data ?? {});
  }

  save() {
    const subscription = this.data
      ? this.officerService.update(this.data.id, this.officerForm.value)
      : this.officerService.create(this.officerForm.value);
    subscription.subscribe((officer) => {
      this.dialogRef.close(officer);
    });
  }
}
