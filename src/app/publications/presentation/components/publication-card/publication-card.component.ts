import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { PublicationService } from '../../services/publication.service';
import { SecureImageViewerComponent } from '../../../../shared';

@Component({
  selector: 'publication-card',
  imports: [CommonModule, MatCardModule, SecureImageViewerComponent],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <img mat-card-avatar src="images/icons/account.png" />
        <mat-card-title class="font-bold">
          {{ publication().user.fullname | titlecase }}
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div class="space-y-4">
          <h3 class="text-2xl font-medium">{{ publication().title }}</h3>

          @if(publication().image){
          <div class="flex justify-center w-full">
            <figure class="h-auto sm:h-[400px]">
              <secure-image-viewer [url]="publication().image" />
            </figure>
          </div>
          }
          <p class="text-justify  whitespace-pre-line">
            {{ publication().content }}
          </p>

          @if(publication().attachments.length > 0){
          <ul class="list-disc px-6">
            @for (item of publication().attachments; track $index) {
              <li>
                <a
                  (click)="openFile(item.fileName)"
                  class="text-blue-600 hover:underline cursor-pointer"
                >
                  {{ item.originalName }}
                </a>
              </li>
            }
          </ul>
          }
        </div>
      </mat-card-content>
      <mat-card-footer>
        <div class="p-4 font-light">
          Creado el {{ publication().createdAt | date : 'short' }}
        </div>
      </mat-card-footer>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationCardComponent {
  private postService = inject(PublicationService);

  publication = input.required<any>();

  openFile(url: string): void {
    this.postService.getFile(url).subscribe((blob) => {
      const fileURL = window.URL.createObjectURL(blob);
      const mime = blob.type;
      if (mime === 'application/pdf' || mime.startsWith('image/')) {
        window.open(fileURL, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = this.extractFileNameFromUrl(url);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setTimeout(() => window.URL.revokeObjectURL(fileURL), 1000);
    });
  }

  private extractFileNameFromUrl(url: string): string {
    return url.split('/').pop() || 'archivo';
  }
}
