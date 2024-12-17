import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
interface PageProps {
  limit: number;
  index: number;
}
@Component({
    selector: 'paginator',
    imports: [CommonModule, MatPaginatorModule],
    templateUrl: './paginator.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent {
  @Input({ required: true }) limit!: number;
  @Input({ required: true }) index!: number;
  @Input({ required: true }) length!: number;
  @Input({ required: true }) pageSizeOptions!: number[];

  @Output() onPageChage: EventEmitter<PageProps> = new EventEmitter();

  changePage(event: PageEvent) {
    this.onPageChage.emit({
      limit: event.pageSize,
      index: event.pageIndex,
    });
  }
}
