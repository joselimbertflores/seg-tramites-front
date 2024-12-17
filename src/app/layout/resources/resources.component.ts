import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidenavButtonComponent } from '../../presentation/components';
import { AlertService, PdfService, ReportService } from '../../presentation/services';

@Component({
    selector: 'resources',
    imports: [CommonModule, MatToolbarModule, SidenavButtonComponent],
    templateUrl: './resources.component.html',
    styleUrl: './resources.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourcesComponent {
  private pdfService = inject(PdfService);
  private reportService = inject(ReportService);
  private alertSrevice = inject(AlertService);

  generateUnlinkSheet() {
    this.alertSrevice.LoadingAlert('Generando reporte', 'Espere porfavor....');
    this.reportService.getUnlinkAccountData().subscribe((data) => {
      this.alertSrevice.CloseLoadingAlert();
      this.pdfService.GenerateUnlinkSheet(data.inbox, data.accont);
    });
  }
}
