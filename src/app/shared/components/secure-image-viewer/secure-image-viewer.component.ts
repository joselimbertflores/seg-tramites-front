import {
  ChangeDetectionStrategy,
  TemplateRef,
  DestroyRef,
  Component,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Dialog, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'secure-image-viewer',
  imports: [CommonModule, DialogModule],
  template: `
    @if(imageData.isLoading()){
      <div class="h-full flex items-center justify-center">
        <div class="size-[100px] m-10 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }
    @else {
      <img
        class="w-auto h-full object-contain rounded-2xl"
        [ngClass]="{ 'cursor-pointer': expandible() }"
        [src]="imageData.value()"
        (click)="openDialog(customDialog)"
      />
    }
    <ng-template #customDialog>
      <div class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
        <button
          class="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition"
          (click)="closeDialog()"
        >
          ✕
        </button>
        <img
          class="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-lg"
          [src]="imageData.value()"
        />
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecureImageViewerComponent {
  private destroyRef = inject(DestroyRef);
  private dialog = inject(Dialog);
  private fileUploadService = inject(FileUploadService);

  url = input.required<string>();
  expandible = input<boolean>(false);
  customDialogRef?: DialogRef<unknown, unknown>;

  imageData = rxResource({
    params: () => ({ url: this.url() }),
    stream: ({ params }) =>
      this.fileUploadService
        .getFile(params.url)
        .pipe(map((blob) => URL.createObjectURL(blob))),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.revokeImageDataUrl(this.imageData.value());
    });
  }

  revokeImageDataUrl(url: string | null | undefined): void {
    if (!url || !url.startsWith('blob:')) return;
    URL.revokeObjectURL(url);
  }

  openDialog(template: TemplateRef<unknown>): void {
    if (!this.expandible()) return;
    this.customDialogRef = this.dialog.open(template, {
      height: '100vh',
      width: '100vw',
    });
  }

  closeDialog(): void {
    this.customDialogRef?.close();
  }
}
