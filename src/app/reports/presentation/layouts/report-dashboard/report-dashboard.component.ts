import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { NavigationEnd, RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';

import { ReportListComponent } from '../../components';
import { ReportCacheService } from '../../services';

@Component({
  selector: 'app-report-dashboard',
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="flex justify-between px-4 py-2 gap-2">
      <div>
        <h2 class="text-2xl font-bold">{{ currentReportProps()?.label }}</h2>
        <p class=" text-lg">{{ currentReportProps()?.description }}</p>
      </div>

      <button
        mat-mini-fab
        aria-label="Menu reports"
        matTooltip="Ver reportes"
        (click)="openBottomSheet()"
      >
        <mat-icon>menu</mat-icon>
      </button>
    </div>

    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportDashboardComponent implements OnInit {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private bottomSheet = inject(MatBottomSheet);
  private reportCacheService = inject(ReportCacheService);

  currentReportProps = this.reportCacheService.currentReport;

  ngOnInit(): void {
    this.listenReportRoutes();
  }

  openBottomSheet(): void {
    this.bottomSheet.open(ReportListComponent, {
      autoFocus: false,
    });
  }

  private listenReportRoutes() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/detail') || url.endsWith('/home')) return;
        this.reportCacheService.lastReportPath.set(url);
      });
  }
}
