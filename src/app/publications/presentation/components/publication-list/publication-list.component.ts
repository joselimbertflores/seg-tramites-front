import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
} from '@angular/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PublicationCardComponent } from '../publication-card/publication-card.component';
import { publication } from '../../../infrastructure/interfaces/publications.interface';
import { InfiniteScrollWrapperComponent } from '../../../../shared';

@Component({
  selector: 'publication-list',
  imports: [
    CommonModule,
    InfiniteScrollModule,
    PublicationCardComponent,
    InfiniteScrollWrapperComponent,
  ],
  template: `
    <!-- <div
      infiniteScroll
      [infiniteScrollDistance]="0.5"
      [infiniteScrollThrottle]="500"
      [infiniteScrollContainer]="containerRef()"
      (scrolled)="load()"
    >
      <div class="flex flex-col gap-y-4">
        @for (pulication of publications(); track $index) {
        <publication-card [publication]="pulication" />
        }
      </div>
    </div> -->

  
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationListComponent implements OnInit {
  containerRef = input.required<HTMLDivElement>();
  publications = input.required<publication[]>();
  onScroll = output<void>();

  ngOnInit(): void {}

  load(): void {
    this.onScroll.emit();
  }
}
