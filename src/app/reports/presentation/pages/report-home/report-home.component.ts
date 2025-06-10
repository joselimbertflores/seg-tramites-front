import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';

import { ReportListComponent } from '../../components';

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
export default class ReportHomeComponent {
  private bottomSheet = inject(MatBottomSheet);

  open() {
    this.bottomSheet.open(ReportListComponent);
  }
}
