import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import { OfficerService } from '../../../services';
import { Officer } from '../../../../domain';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-officer-dialog',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
    ],
    templateUrl: './officer-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfficerDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private officerService = inject(OfficerService);

  public data?: Officer = inject(MAT_DIALOG_DATA);
  public formOfficer: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    paterno: ['', Validators.required],
    materno: [''],
    dni: ['', Validators.required],
    telefono: ['', Validators.required],
    activo: [true, Validators.required],
  });

  ngOnInit(): void {
    this.formOfficer.patchValue(this.data ?? {});
  }

  save() {
    const subscription = this.data
      ? this.officerService.update(this.data._id, this.formOfficer.value)
      : this.officerService.create(this.formOfficer.value);
    subscription.subscribe((officer) => {
      this.dialogRef.close(officer);
    });
  }
}
