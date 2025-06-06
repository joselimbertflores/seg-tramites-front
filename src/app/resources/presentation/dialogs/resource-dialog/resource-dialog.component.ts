import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { forkJoin, map, switchMap } from 'rxjs';

import {
  AutocompleteComponent,
  FileUploaderComponent,
  FileUploadService,
} from '../../../../shared';
import { ResourceService } from '../../services/resource.service';


@Component({
  selector: 'app-resource-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    FileUploaderComponent,
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
          (onSelect)="onSelectAutoCompleteOption($event)"
        />
      </div>
      <file-uploader
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

  onSelectAutoCompleteOption(option: string) {
    this.category.setValue(option);
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
