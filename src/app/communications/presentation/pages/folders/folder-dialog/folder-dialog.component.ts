import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-folder-dialog',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,CommonModule],
  template: `
    <h2 mat-dialog-title>Crear nueva carpeta</h2>
    <mat-dialog-content>
      <mat-form-field class="w-full">
        <mat-label>Nombre de la carpeta</mat-label>
        <input matInput [formControl]="name" />
        <mat-error *ngIf="name.hasError('required')">
          El nombre es obligatorio.
        </mat-error>
        <mat-error *ngIf="name.hasError('minlength')">
          Debe tener al menos 3 caracteres.
        </mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="create()"
        [disabled]="name.invalid"
      >
        Agregar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolderDialogComponent {
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  constructor(
    private dialogRef: MatDialogRef<FolderDialogComponent>,
    private fb: FormBuilder
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  create() {
    if (this.name.valid) {
      this.dialogRef.close(this.name.value);
    }
  }
}
