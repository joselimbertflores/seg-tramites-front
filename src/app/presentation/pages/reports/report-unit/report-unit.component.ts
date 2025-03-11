import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { SimpleSelectSearchComponent } from '../../../components';
import { MaterialModule } from '../../../../material.module';

@Component({
    selector: 'app-report-unit',
    imports: [CommonModule, SimpleSelectSearchComponent, MaterialModule],
    templateUrl: './report-unit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportUnitComponent implements OnInit {
  // private reporteService = inject(ReportService);
  // private pdfService = inject(PdfService);
  dependencies = signal<{ text: string; value: string }[]>([]);
  institutions = signal<{ text: string; value: string }[]>([]);
  displayedColumns: string[] = [
    'officer',
    'pending',
    'received',
    'rejected',
    'completed',
    'archived',
    'options',
  ];
  dataSource = signal<any[]>([]);

  public displaycolums: any[] = [
    { columnDef: 'code', header: 'Alterno' },
    { columnDef: 'reference', header: 'Referencia' },
    { columnDef: 'state', header: 'Estado' },
    { columnDef: 'applicant', header: 'Fecha' },
    { columnDef: 'startDate', header: 'Emisor' },
  ];

  ngOnInit(): void {
    this.getInsitutions();
  }

  getInsitutions() {
    // this.reporteService.getInstitutions().subscribe((data) => {
    //   this.institutions.set(
    //     data.map(({ _id, nombre }) => ({ value: _id, text: nombre }))
    //   );
    // });
  }

  onSelectInstitution(id: string) {
    this.dataSource.set([]);
    this.getDependencyByInstitution(id);
  }

  onSelectDependency(id: string) {
    // this.reporteService.getPendingsByUnit(id).subscribe((data) => {
    //   this.dataSource.set(data);
    // });
  }
  getDependencyByInstitution(id: string) {
    // this.reporteService.getDependencies(id).subscribe((data) => {
    //   this.dependencies.set(
    //     data.map(({ _id, nombre }) => ({ value: _id, text: nombre }))
    //   );
    // });
  }

  getInbox(accountId: string) {
    // this.reporteService.getInboxAccount(accountId).subscribe((data) => {
    //   const fullname = data[0].receiver.fullname ?? 'NO SELECCIONADO';
    //   this.pdfService.GenerateReportSheet({
    //     title: `TRAMITES PENDIENTES: ${fullname}`,
    //     results: data.map((el) => ({
    //       code: el.procedure.code,
    //       reference: el.procedure.reference,
    //       state: el.procedure.state,
    //       applicant: el.emitter.fullname,
    //       startDate: el.outboundDate,
    //     })),
    //     columns: this.displaycolums,
    //   });
    // });
  }
}
