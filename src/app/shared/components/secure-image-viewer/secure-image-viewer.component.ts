import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  linkedSignal,
  OnChanges,
  OnInit,
  resource,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom, map } from 'rxjs';

import { FileUploadService } from '../../services/file-upload.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'secure-image-viewer',
  imports: [CommonModule],
  template: `
    <div class="image-wrapper">
      {{ imageUrl() }}
      <!-- <ng-container *ngIf="loading">Loading...</ng-container> -->
      <!-- @if(imageDataUrl()){
      <img [src]="imageDataUrl()" class="w-[200px]" />
      } -->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecureImageViewerComponent implements OnInit, OnChanges {
  private fileUploadService = inject(FileUploadService);
  imageUrl = input.required<string>();

  // imageBlob = rxResource({
  //   params: () => ({ url: this.imageUrl() }),
  //   loader: ({ params }) =>
  //     this.fileUploadService
  //       .getFile(params.url)
  //       .pipe(map((blob) => URL.createObjectURL(blob))),
  // });

  constructor() {
    effect(() => {
      // console.log('exect effect => ', this.imageBlob.value());
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageUrl'] && this.imageUrl()) {
      // console.log('ON CHANGE EXECUTED', this.imageUrl());
    }
  }

  ngOnInit(): void {}

  private loadImage() {}
}
