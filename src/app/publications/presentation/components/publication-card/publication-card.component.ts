import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { publication } from '../../../infrastructure/interfaces/publications.interface';
import { PostService } from '../../services/post.service';

@Component({
    selector: 'publication-card',
    imports: [CommonModule, MatCardModule],
    template: `
    <mat-card class="w-full" appearance="outlined">
      <mat-card-header>
        <img mat-card-avatar src="/assets/img/account.png" />
        @if(publication().user.funcionario){
        <mat-card-title>
          {{ publication().user.funcionario.nombre }}
          {{ publication().user.funcionario.paterno }}
          {{ publication().user.funcionario.materno }}
        </mat-card-title>

        } @else {
        <mat-card-title> Administrador </mat-card-title>
        }
        <mat-card-subtitle>
          <span class="text-sm">{{ publication().user.jobtitle }}</span>
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p class="text-2xl">{{ publication().title }}</p>
        <p>{{ publication().content }}</p>
        <ul class="list-disc px-4">
          @for (item of publication().attachments; track $index) {
          <li>
            <span
              (click)="openFile(item.filename)"
              class="text-blue-500 underline cursor-pointer"
            >
              {{ item.title }}
            </span>
          </li>
          }
        </ul>
      </mat-card-content>
      <mat-card-actions>
        <span class="px-2 mt-4">
          {{ publication().createdAt | date : 'medium' }}
        </span>
      </mat-card-actions>
    </mat-card>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicationCardComponent {
  private postService = inject(PostService);

  publication = input.required<publication>();

  openFile(url: string): void {
    this.postService.getFile(url).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
    });
  }
}
