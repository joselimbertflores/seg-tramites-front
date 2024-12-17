import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PostService } from '../../services/post.service';
import { publication } from '../../../infrastructure';
import { PublicationListComponent } from '../../components';

@Component({
    selector: 'app-publication-history',
    imports: [CommonModule, MatToolbarModule, PublicationListComponent],
    templateUrl: './publication-history.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PublicationHistoryComponent implements OnInit {
  private publicationService = inject(PostService);

  publications = signal<publication[]>([]);

  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  isLoading = signal(false);

  ngOnInit(): void {
    this.getPublications();
  }

  getPublications(): void {
    this.isLoading.set(true);
    this.publicationService
      .findAll(this.limit(), this.offset())
      .subscribe((publications) => {
        this.publications.update((values) => [...values, ...publications]);
        this.isLoading.set(false);
      });
  }

  loadMorePublications(): void {
    if (this.isLoading()) return;
    this.index.update((value) => (value += 1));
    this.getPublications();
  }
}
