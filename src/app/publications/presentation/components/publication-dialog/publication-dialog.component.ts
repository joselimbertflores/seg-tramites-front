import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { PublicationCardComponent } from '../publication-card/publication-card.component';
import { PublicationService } from '../../services/publication.service';
import { publication } from '../../../infrastructure';

@Component({
  selector: 'app-publication-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    PublicationCardComponent,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title class="header-news text-center">
      Comunicados ({{ data.length }})
    </h2>
    <mat-dialog-content>
      <div>
        <div class="flex flex-col gap-y-4">
          @for (pulication of publications(); track $index) {
          <publication-card [publication]="pulication" />
          } @if (isLoading()) {
          <div class="flex w-full gap-x-4 justify-center items-center">
            <mat-spinner [diameter]="40" />
            <span class="sm:text-xl">Cargando contenido...</span>
          </div>
          }
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>
        Aceptar
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .header-news{
      background-color:var(--mat-sys-primary);
      color:white;
    }
    .mdc-dialog__title::before { display: none !important; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationDialogComponent {
  private publicationService = inject(PublicationService);
  data = inject<publication[]>(MAT_DIALOG_DATA);

  publications = signal<publication[]>([]);

  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  isLoading = signal(false);

  constructor() {
    this.publications.set(this.data);
  }

  loadMorePublications() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.index.update((value) => (value += 1));
    this.publicationService
      .getNews(this.limit(), this.offset())
      .subscribe((publications) => {
        this.publications.update((values) => [...values, ...publications]);
        this.isLoading.set(false);
      });
  }
}
