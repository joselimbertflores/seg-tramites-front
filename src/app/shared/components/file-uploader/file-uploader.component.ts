import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FileIconPipe } from '../../pipes/file-icon.pipe';
import { attachmentFile } from '../../../publications/domain';

@Component({
  selector: 'file-uploader',
  imports: [CommonModule, MatButtonModule, MatIconModule, FileIconPipe],
  template: `
    <div class="flex justify-between items-center p-2">
      <span class="text-lg">Listado de archivos:</span>
      <button mat-mini-fab aria-label="Attach file" (click)="fileInput.click()">
        <mat-icon>attach_file</mat-icon>
      </button>
      <input
        #fileInput
        type="file"
        [hidden]="true"
        [multiple]="multiple()"
        [accept]="accept()"
        (change)="add($event)"
      />
    </div>

    <ul class="space-y-2 mt-2">
      @for (item of displayFiles(); track $index) {
      <li
        class="flex items-center justify-between p-2 border border-slate-300 rounded-xl"
      >
        <div class="flex items-center space-x-3">
          <img
            class="size-8"
            [src]="item.file.name | fileIcon"
            alt="Icon file"
          />
          <div>
            <p class="text-sm font-medium">
              {{ item.file.name }}
            </p>
            <p class="text-xs font-light">{{ item.size }}</p>
          </div>
        </div>
        <button
          mat-icon-button
          aria-label="Remive file"
          (click)="remove($index)"
        >
          <mat-icon class="text-red-600">close</mat-icon>
        </button>
      </li>
      }  
      @for (item of uploadedFiles(); track $index) {
      <li
        class="flex items-center justify-between p-2 border border-slate-300 rounded-xl"
      >
        <div class="flex items-center space-x-3">
          <img
            class="size-8"
            [src]="item.fileName | fileIcon"
            alt="Icon file"
          />
          <div>
            <p class="text-sm font-medium">
              {{ item.originalName }}
            </p>
            <p class="text-xs font-medium text-green-600">Subido</p>
          </div>
        </div>
        <button
          mat-icon-button
          aria-label="Remive file"
          (click)="removeUploadedFile($index)"
        >
          <mat-icon class="text-red-600">close</mat-icon>
        </button>
      </li>
      }
      @if(displayFiles().length === 0 && this.uploadedFiles().length === 0){
        <li class="px-4 text-lg">Sin elementos</li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent {
  files = model<File[]>([]);
  multiple = input(false);
  allowedExtensions = input<string[]>([]);
  accept = computed(() => {
    if (this.allowedExtensions().length === 0) return null;
    return this.allowedExtensions()
      .map((ext) => '.' + ext.toLowerCase())
      .join(',');
  });

  displayFiles = computed(() =>
    this.files().map((item) => ({
      file: item,
      size: this.formatFileSize(item.size),
    }))
  );

  // * Optional, for manage uploaded files
  uploadedFiles = model<attachmentFile[]>([]);

  add(event: Event): void {
    const selectedFiles = this.onInputFileSelect(event);
    const newFiles = selectedFiles.filter((file) => !this.isDuplicate(file));
    if (newFiles.length === 0) return;
    this.files.update((values) => [...newFiles, ...values]);
  }

  remove(index: number) {
    this.files.update((values) => {
      values.splice(index, 1);
      return [...values];
    });
  }

  removeUploadedFile(index: number) {
    this.uploadedFiles.update((values) => {
      values.splice(index, 1);
      return [...values];
    });
  }

  private onInputFileSelect(event: Event): File[] {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files || inputElement.files.length === 0) return [];
    return Array.from(inputElement.files);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private isDuplicate(file: File): boolean {
    return this.files().some((uploadedFile) => uploadedFile.name === file.name);
  }
}
