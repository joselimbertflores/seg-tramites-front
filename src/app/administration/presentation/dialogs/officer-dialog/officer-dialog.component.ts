import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormBuilder,
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
  ],
  templateUrl: './officer-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficerDialogComponent {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private officerService = inject(OfficerService);

  data: Officer | undefined = inject(MAT_DIALOG_DATA);
  officerForm: FormGroup = this.formBuilder.group({
    nombre: ['', Validators.required],
    paterno: ['', Validators.required],
    materno: [''],
    dni: ['', Validators.required],
    telefono: ['', Validators.required],
    activo: [true, Validators.required],
  });

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
