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
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'file-upload',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div class="flex justify-between items-center p-2">
      <span>Archivos:</span>
      <button mat-mini-fab aria-label="Attach file" (click)="fileInput.click()">
        <mat-icon>attach_file</mat-icon>
      </button>
      <input
        #fileInput
        type="file"
        [hidden]="true"
        [attr.multiple]="multiple() ? '' : null"
        [attr.accept]="acceptAttr()"
        (change)="add($event)"
      />
    </div>
    <ul class="mt-4 space-y-2">
      @for (item of selectedFilesProps(); track $index) {
      <li class="flex items-center justify-between p-2 border rounded-xl">
        <div class="flex items-center space-x-3">
          <img
            class="size-6"
            [src]="'images/icons/files/' + item.icon"
            alt="Icon file"
          />
          <div>
            <p class="text-gray-700 text-sm font-medium">
              {{ item.file.name }}
            </p>
            <p class="text-xs font-light">{{ item.size }}</p>
          </div>
        </div>
        <button
          (click)="remove($index)"
          class="text-red-500 hover:text-red-700 transition"
          title="Eliminar"
        >
          ✖
        </button>
      </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  files = model<File[]>([]);
  multiple = input(false);
  allowedExtensions = input<string[]>([]);
  selectedFilesProps = computed(() =>
    this.files().map((item) => ({
      file: item,
      size: this.formatFileSize(item.size),
      icon: this.getIconByExtension(item),
    }))
  );

  acceptAttr = computed(() => {
    if (this.allowedExtensions().length === 0) return undefined;
    return this.allowedExtensions()
      .map((ext) => '.' + ext)
      .join(',');
  });

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

  private getIconByExtension(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return 'pdf.png';
      case 'docx':
        return 'doc.png';
      case 'xlsx':
        return 'xls.png';
      case 'ods':
        return 'xls.png';
      case 'mp4':
        return 'video.png';
      case 'png':
        return 'image.png';
      case 'jpg':
        return 'image.png';
      case 'jpeg':
        return 'image.png';
      default:
        return 'unknow.png';
    }
  }

  isDuplicate(file: File): boolean {
    return this.files().some((uploadedFile) => uploadedFile.name === file.name);
  }
}
