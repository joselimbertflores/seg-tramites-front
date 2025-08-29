import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  computed,
  signal,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface FileItem {
  file: File;
  preview: string | null;
}

@Component({
  selector: 'file-chat-selector',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './file-chat-selector.component.html',
  styles: `
    .file-panel {
      background: var(--mat-sys-surface-container-low);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileChatSelectorComponent {
  selectedFiles = signal<FileItem[]>([]);

  currentIndex = signal<number>(0);

  isDisplayPanel = computed(() => this.selectedFiles().length > 0);

  currentFile = linkedSignal<FileItem>(() => {
    const index = this.currentIndex();
    return this.selectedFiles()[index];
  });

  onCofirmFiles = output<File[]>();

  ALLOWED_EXTENSIONS: string[] = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'mp4',
    'mp3',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ods',
    'odp',
  ];
  ACCEPTED_FILE_TYPES = this.ALLOWED_EXTENSIONS.map((type) => `.${type}`).join(
    ','
  );

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;

    if (!inputElement?.files || inputElement.files?.length === 0) return;

    const files = Array.from(inputElement.files).filter(
      (file) => !this.isDuplicate(file) && this.isValidTYpe(file)
    );

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = { file, preview: this.getPreview(file, e) };
        this.selectedFiles.update((values) => [...values, newFile]);
      };
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.update((values) => {
      values.splice(index, 1);
      return [...values];
    });
    if (this.currentIndex() >= this.selectedFiles().length) {
      this.currentIndex.set(0);
    }
  }

  close(): void {
    this.currentIndex.set(0);
    this.selectedFiles.set([]);
  }

  upload(): void {
    this.onCofirmFiles.emit(this.selectedFiles().map((item) => item.file));
    this.close();
  }

  private getPreview(file: File, e: ProgressEvent<FileReader>): string | null {
    return file.type.startsWith('image/') ? (e.target?.result as string) : null;
  }

  private isDuplicate(file: File): boolean {
    return this.selectedFiles().some(
      (item) =>
        item.file.name === file.name &&
        item.file.size === file.size &&
        item.file.lastModified === file.lastModified
    );
  }

  private isValidTYpe(file: File): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.ALLOWED_EXTENSIONS.includes(extension)) {
      return false;
    }
    return true;
  }
}
