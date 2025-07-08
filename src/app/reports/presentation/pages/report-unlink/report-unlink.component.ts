import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { finalize, switchMap } from 'rxjs';

import { CommunicationReportService } from '../../services';
import { PdfService } from '../../../../shared';

@Component({
  selector: 'app-report-unlink',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="container text-center p-4">
      <h2 class="mb-3 text-lg">Reporte de Desvinculación</h2>

      <p class="text-muted mb-4">
        Este reporte contiene el detalle de los trámites pendientes del usuario
        actual, para el proceso de salida o reasignación.
      </p>

      <button matButton="filled" [disabled]="isLoading()" (click)="generateReport()">
        @if(isLoading()){
          <div class="flex items-center gap-x-4">
            <mat-spinner [diameter]="20"/>
            Generando
          </div>
        }
        @else {
          Generar reporte
        }
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportUnlinkComponent {
  private reportService = inject(CommunicationReportService);
  private pdfService = inject(PdfService);

  isLoading = signal(false);

  generateReport() {
    this.isLoading.set(true);
    this.reportService
      .getUnlinkData()
      .pipe(
        switchMap((data) => this.pdfService.unlinkSheet(data)),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((pdf) => {
        pdf.open();
      });
  }
}
