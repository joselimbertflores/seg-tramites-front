import { inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import {
  MatBottomSheetRef,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';

import { ReportCacheService, ReportItem } from '../../services';

@Component({
  selector: 'app-report-list',
  imports: [RouterModule, MatListModule, MatBottomSheetModule],
  template: `
    <div class="py-2 text-lg">Reportes disponibles</div>
    <mat-nav-list>
      @for (item of menu(); track $index) {
      <a
        routerLinkActive
        [routerLink]="item.link"
        #link="routerLinkActive"
        [activated]="link.isActive"
        mat-list-item
        (click)="openLink($event, item)"
      >
        <span matListItemTitle>{{ item.label }}</span>
        <span matListItemLine>{{ item.description }}</span>
      </a>
      }
    </mat-nav-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportListComponent {
  private reportCacheService = inject(ReportCacheService);
  private _bottomSheetRef = inject(MatBottomSheetRef);
  menu = this.reportCacheService.menu;

  openLink(event: MouseEvent, item:ReportItem): void {
    this.reportCacheService.setCurrentReportProps(item);
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
