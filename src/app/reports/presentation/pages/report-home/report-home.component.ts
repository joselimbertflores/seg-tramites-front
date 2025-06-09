import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';

import { ReportListComponent } from '../../components';
import { ReportCacheService } from '../../services';

@Component({
  selector: 'app-report-home',
  imports: [MatButtonModule],
  template: `
    <div
      class="flex items-center justify-center w-full "
      style="height: calc(100vh - 120px);"
    >
      <div class="max-w-2xl px-2">
        <div class="text-center mb-4">
          <h1 class="text-xl tracking-wide text-balance sm:text-4xl">
            Seccion de reportes
          </h1>
          <p class="mt-2 text-lg text-pretty sm:text-lg/8">
            Seleccione uno de los reportes disponibles para comenzar
          </p>
          <div class="mt-2">
            <button mat-flat-button (click)="open()">Ver reportes</button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportHomeComponent implements OnInit {
  private router = inject(Router);
  private bottomSheet = inject(MatBottomSheet);
  private reportCacheService = inject(ReportCacheService);

  ngOnInit(): void {
    this.navigateToLastReportRoute()
  }

  open() {
    this.bottomSheet.open(ReportListComponent);
  }

  navigateToLastReportRoute() {
    const lastPath = this.reportCacheService.getLastReportPath();
    if (lastPath && lastPath !== this.router.url) {
      this.router.navigateByUrl(lastPath, { replaceUrl: true });
    }
  }
}
