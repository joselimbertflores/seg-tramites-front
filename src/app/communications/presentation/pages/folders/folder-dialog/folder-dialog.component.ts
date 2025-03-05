import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { FolderService } from '../../../services';

@Component({
  selector: 'app-folder-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
  template: `
    <h2 mat-dialog-title>Crear carpeta</h2>
    <mat-dialog-content>
      <div class="pt-2">
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
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="warn" mat-dialog-close>Cancelar</button>
      <button
        mat-button
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
  private dialogRef = inject(MatDialogRef);
  private folderService = inject(FolderService);

  name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  constructor() {}

  create() {
    this.folderService.create(this.name.value).subscribe((folder) => {
      this.dialogRef.close(folder);
    });
  }
}
