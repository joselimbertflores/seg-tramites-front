import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-archive-dialog',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Crear nueva carpeta</h2>
    <mat-dialog-content>
      <form [formGroup]="formGroup">
        <mat-form-field class="w-full">
          <mat-label>Nombre de la carpeta</mat-label>
          <input matInput formControlName="nombre" />
          <mat-error *ngIf="formGroup.get('nombre')?.hasError('required')">
            El nombre es obligatorio.
          </mat-error>
          <mat-error *ngIf="formGroup.get('nombre')?.hasError('minlength')">
            Debe tener al menos 4 caracteres.
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="create()"
        [disabled]="formGroup.invalid"
      >
        Agregar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchiveDialogComponent {
  formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ArchiveDialogComponent>,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  create() {
    if (this.formGroup.valid) {
      this.dialogRef.close(this.formGroup.get('nombre')?.value);
    }
  }
}
