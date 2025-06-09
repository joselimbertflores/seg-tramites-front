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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { PublicationService } from '../../services/publication.service';
import { InfiniteScrollWrapperComponent } from '../../../../shared';
import { PublicationCardComponent } from '../../components';
import { publication } from '../../../infrastructure';

@Component({
  selector: 'app-publication-history',
  imports: [
    CommonModule,
    MatToolbarModule,
    PublicationCardComponent,
    InfiniteScrollWrapperComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './publication-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PublicationHistoryComponent implements OnInit {
  private publicationService = inject(PublicationService);

  publications = signal<publication[]>([]);

  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  isLoading = signal(true);

  ngOnInit(): void {
    this.getPublications();
  }

  getPublications(): void {
    this.isLoading.set(true);
    this.publicationService
      .findAll(this.limit(), this.offset())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((publications) => {
        this.publications.update((values) => [...values, ...publications]);
      });
  }

  loadMorePublications(): void {
    if (this.isLoading()) return;
    this.index.update((value) => (value += 1));
    this.getPublications();
  }
}
