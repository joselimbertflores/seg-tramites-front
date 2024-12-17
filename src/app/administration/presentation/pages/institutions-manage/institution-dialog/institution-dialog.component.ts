import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { InstitutionService } from '../../../services/institution.service';
import { MaterialModule } from '../../../../../material.module';
import { institution } from '../../../../infrastructure';

@Component({
    selector: 'app-institution-dialog',
    imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './institution-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstitutionDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private institutionService = inject(InstitutionService);
  private dialogRef = inject(MatDialogRef<InstitutionDialogComponent>);

  data = inject<institution | undefined>(MAT_DIALOG_DATA);
  FormInstitution: FormGroup = this.fb.group({
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
    activo:[true]
  });

  ngOnInit(): void {
    this.FormInstitution.patchValue(this.data ?? {});
  }

  save() {
    const subscription = this.data
      ? this.institutionService.edit(
          this.data._id,
          this.FormInstitution.value
        )
      : this.institutionService.add(this.FormInstitution.value);
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }
}
