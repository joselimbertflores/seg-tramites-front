import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-report-unlink',
  imports: [MatButtonModule],
  template: `
    <div class="container text-center p-4">
      <h2 class="mb-3 text-lg">Reporte de Desvinculación</h2>
      <p class="text-muted mb-4">
        Este reporte contiene el detalle de los trámites pendientes del usuario
        actual, para el proceso de salida o reasignación.
      </p>

      <button mat-raised-button color="primary">Generar reporte en PDF</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportUnlinkComponent {}
