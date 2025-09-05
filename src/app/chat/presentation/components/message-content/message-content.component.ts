import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FileUploadService, SecureImageViewerComponent } from '../../../../shared';
import { Message } from '../../../domain';

@Component({
  selector: 'message-content',
  imports: [MatIconModule, MatButtonModule, SecureImageViewerComponent],
  template: `
    @switch (message().type) { 
      @case ("text") {
        <p class="text-sm mt-1">{{ message().content }}</p>
      }
      @case ("image") {
        <div class="h-[200px] rounded-lg overflow-hidden">
          <secure-image-viewer [url]="message().media!.fileName"  [expandible]="true" />
        </div>
      }
      @case ("video") {
        <div class="flex items-center p-3 border border-gray-400 rounded-lg w-full">
          <mat-icon class="mr-2">videocam</mat-icon>
          <div class="flex-1 truncate text-sm">
            {{ message().media?.originalName }}
          </div>
          <button matIconButton (click)="download()" class="ml-4">
            <mat-icon>download</mat-icon>
          </button>
        </div>
      }
      @case ("audio") {
        <div class="flex items-center p-3 border border-gray-400 rounded-lg w-full">
          <mat-icon class="mr-2">headphones</mat-icon>
          <div class="flex-1 truncate text-sm">
            {{ message().media?.originalName }}
          </div>
          <button matIconButton (click)="download()" class="ml-4">
            <mat-icon>download</mat-icon>
          </button>
        </div>
      }
      @case ("document"){
        <div class="flex items-center p-3 border border-gray-400 rounded-lg w-full">
          <mat-icon class="mr-2">insert_drive_file</mat-icon>
          <div class="flex-1 truncate text-sm">
            {{ message().media?.originalName }}
          </div>
          <button matIconButton (click)="download()" class="ml-4">
            <mat-icon>download</mat-icon>
          </button>
        </div>
      }
      @default {
        <p class="font-extralight italic">Error: Unknown message type</p>
      }
    } 
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageContentComponent {
  private fileUploadService = inject(FileUploadService);
  message = input.required<Message>();

  download() {
    if (!this.message().media) return;
    const { fileName, originalName } = this.message().media!;
    this.fileUploadService.downloadFileFromUrl(fileName, originalName)
  }
}
