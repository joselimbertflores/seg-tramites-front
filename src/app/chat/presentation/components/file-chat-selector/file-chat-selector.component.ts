import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
  signal,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileChatSelectorComponent {
  selectedFiles = signal<FileItem[]>([]);

  currentIndex = signal<number>(0);

  currentFile = linkedSignal<FileItem | null>(() => {
    const index = this.currentIndex();
    return this.selectedFiles()[index] || null;
  });

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;

    if (!inputElement?.files || inputElement.files?.length === 0) return;

    const files = Array.from(inputElement.files);

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

  close() {
    this.selectedFiles.set([]);
    this.currentIndex.set(0);
  }

  private getPreview(file: File, e: ProgressEvent<FileReader>): string | null {
    return file.type.startsWith('image/') ? (e.target?.result as string) : null;
  }
}
