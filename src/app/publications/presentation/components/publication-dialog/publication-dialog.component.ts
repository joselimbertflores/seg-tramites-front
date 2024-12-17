import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { PostService } from '../../services/post.service';
import { publication } from '../../../infrastructure';
import { PublicationListComponent } from '..';

@Component({
    selector: 'app-publication-dialog',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        PublicationListComponent,
    ],
    template: `
    <h2 mat-dialog-title>Publicaciones</h2>
    <mat-dialog-content>
      <div class="h-full overflow-scroll" #containerRef>
        <publication-list
          [containerRef]="containerRef"
          [publications]="publications()"
          (onScroll)="loadMorePublications()"
        ></publication-list>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>
        Aceptar
      </button>
    </mat-dialog-actions>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicationDialogComponent {
  private publicationService = inject(PostService);
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
