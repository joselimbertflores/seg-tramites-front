import {
  ChangeDetectionStrategy,
  SimpleChanges,
  OnChanges,
  Component,
  inject,
  input,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'secure-image-viewer',
  imports: [CommonModule],
  template: `
    @if(imageDataUrl()){
    <img
      class="w-auto h-full object-contain rounded-2xl"
      [src]="imageDataUrl()"
    />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecureImageViewerComponent implements OnChanges {
  private destroyRef = inject(DestroyRef);
  private fileUploadService = inject(FileUploadService);
  imageUrl = input.required<string>();
  imageDataUrl = signal<string | null>(null);
  isLoading = signal(true);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.revokeBlobUrl(this.imageDataUrl());
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageUrl'] && this.imageUrl()) {
      this.loadImage();
    }
  }

  private loadImage() {
    this.fileUploadService
      .getFile(this.imageUrl())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          this.imageDataUrl.update((value) => {
            this.revokeBlobUrl(value);
            return URL.createObjectURL(blob);
          });
        },
      });
  }

  revokeBlobUrl(url: string | null) {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}
