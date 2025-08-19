import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Component({
  selector: 'infinite-scroll-wrapper',
  imports: [InfiniteScrollDirective],
  template: `
    <div
      infiniteScroll
      [infiniteScrollDistance]="2"
      [infiniteScrollThrottle]="500"
      [infiniteScrollContainer]="containerRef()"
      (scrolled)="load()"
      (scrolledUp)="onScrollUp.emit()"
    >
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfiniteScrollWrapperComponent {
  containerRef = input.required<HTMLDivElement>();
  onScroll = output<void>();
  onScrollUp = output<void>();

  load(): void {
    this.onScroll.emit();
  }
}
