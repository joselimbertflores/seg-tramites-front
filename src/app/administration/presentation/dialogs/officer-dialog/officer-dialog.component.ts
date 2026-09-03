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
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

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
    MatCheckboxModule,
  ],
  templateUrl: './officer-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficerDialogComponent {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private officerService = inject(OfficerService);

  data: Officer = inject(MAT_DIALOG_DATA);
  officerForm: FormGroup = this.formBuilder.group({
    activo: [this.data.activo, { nonNullable: true }],
    telefono: [
      this.data.telefono ?? null,
      Validators.pattern('^[0-9]*$'),
    ],
  });

  save() {
    const value = this.officerForm.value;
    const update = {
      activo: value.activo,
      telefono:
        value.telefono === '' || value.telefono === null
          ? null
          : Number(value.telefono),
    };

    this.officerService.update(this.data.id, update).subscribe((officer) => {
      this.dialogRef.close(officer);
    });
  }
}
