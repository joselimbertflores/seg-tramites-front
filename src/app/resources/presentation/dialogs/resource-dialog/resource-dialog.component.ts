import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  AutocompleteComponent,
  AutocompleteOption,
  FileUploadComponent,
  FileUploadService,
} from '../../../../shared';
import { MatInputModule } from '@angular/material/input';
import { toSignal } from '@angular/core/rxjs-interop';
import { ResourceService } from '../../services/resource.service';
import { forkJoin, map, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resource-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    FileUploadComponent,
    MatInputModule,
    AutocompleteComponent,
  ],
  template: `
    <h2 mat-dialog-title>Crear Recurso</h2>
    <mat-dialog-content>
      <div class="pt-2">
        <autocomplete
          [items]="categories()"
          [autoFilter]="true"
          placeholder="Ingrese la categoria"
          title="Categoria"
          (onTyped)="onAutocompleteTyped($event)"
        />
      </div>
      <file-upload
        [multiple]="true"
        [(files)]="files"
        [allowedExtensions]="VALID_EXTENSIONS"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-button [disabled]="!isFromValid" (click)="create()">
        Aceptar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceDialogComponent {
  private fileUploadService = inject(FileUploadService);
  private resourceServioce = inject(ResourceService);

  private dialogRef = inject(MatDialogRef);
  readonly VALID_EXTENSIONS = [
    'png',
    'jpeg',
    'jpg',
    'mp4',
    'ppt',
    'pptx',
    'odp',
    'xls',
    'xlsx',
    'ods',
    'doc',
    'docx',
    'odt',
    'pdf',
  ];
  files = signal<File[]>([]);

  categories = toSignal(
    this.resourceServioce
      .getCategories()
      .pipe(map((items) => items.map((item) => ({ text: item, value: item })))),
    { initialValue: [] }
  );

  category = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  create() {
    this.buildUploadFileTask()
      .pipe(
        switchMap((files) =>
          this.resourceServioce.create(this.category.value, files)
        )
      )
      .subscribe((data) => {
        this.dialogRef.close(data);
      });
  }

  onAutocompleteTyped(term: string) {
    this.category.setValue(term);
  }

  get isFromValid() {
    return this.category.valid && this.files().length > 0;
  }

  private buildUploadFileTask() {
    return forkJoin(
      this.files().map((file) =>
        this.fileUploadService.uploadFile(file, 'resource')
      )
    );
  }
}
