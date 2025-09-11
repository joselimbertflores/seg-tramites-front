import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map } from 'rxjs';

import { FileUploadService } from '../../../services/file-upload.service';
import { SafePipe } from '../../../pipes/safe.pipe';

interface FileData {
  fileName: string;
  originalName?:string
}

type PreviewFileType = 'image' | 'video' | 'pdf' | 'unknown';

const fileTypeMap: Record<string, PreviewFileType> = {
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  mp4: 'video',
  webm: 'video',
  pdf: 'pdf',
};

@Component({
  selector: 'app-file-preview-dialog',
  imports: [SafePipe],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center">
      <button
        class="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition"
        (click)="close()"
      >
        ✕
      </button>

      @if(isLoading()){
        <div class="h-full flex items-center justify-center">
          <div class="size-[100px] m-10 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="ml-2 text-xl">Cargando contenido....</span>
        </div>
      }
      @else {
        @switch (previewFileType()) {
          @case ('image') {
            <img [src]="previewUrl()" class="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-lg" />
          }
          @case ("video") {
            <video [src]="previewUrl()" controls autoplay class="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-lg"></video>
          }
          @case ('pdf') {
            <iframe [src]="previewUrl()!|safe" class="w-[80vw] h-[80vh] rounded-2xl shadow-lg "></iframe>
          }
          @default {
            <div class="text-xl">
              No se puede previsualizar este archivo. 
              <button class="ml-2 underline text-blue-500" (click)="download()">Descargar</button>
            </div>
          } 
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePreviewDialogComponent implements OnInit, OnDestroy {
  private fileUploadService = inject(FileUploadService);

  data = inject<FileData>(DIALOG_DATA);
  isLoading = signal(true);
  previewFileType = signal(this.getFileType());
  previewUrl = toSignal(
    this.fileUploadService.getFile(this.data.fileName).pipe(
      finalize(() => this.isLoading.set(false)),
      map((blob) => URL.createObjectURL(blob))
    )
  );

  constructor(public dialogRef: DialogRef<void>) {}

  ngOnInit(): void {
    this.getFileType();
  }

  ngOnDestroy(): void {
    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }
  }

  close() {
    this.dialogRef.close();
  }

  download() {
    this.fileUploadService.downloadFileFromUrl(this.data.fileName, this.data.originalName);
  }


  private getFileType(): PreviewFileType {
    const extension = this.data.fileName.split('.').pop()?.toLowerCase() ?? '';
    return fileTypeMap[extension] ?? 'unknown';
  }
}
