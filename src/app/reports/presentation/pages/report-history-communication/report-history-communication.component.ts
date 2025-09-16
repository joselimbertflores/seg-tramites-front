import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';

import {
  tableProcedureData,
  tableProcedureColums,
} from '../../../infrastructure';
import { CommunicationReportService, ReportCacheService } from '../../services';
import { ReportProcedureTableComponent } from '../../components';
import { PdfService } from '../../../../shared';

interface cache {
  dataSource: tableProcedureData[];
  form: object;
  limit: number;
  index: number;
  dataSize: number;
  hasSearched:boolean
}
@Component({
  selector: 'app-report-history-communication',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatProgressBarModule,
    ReportProcedureTableComponent,
  ],
  templateUrl:"./report-history-communication.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportHistoryCommunicationComponent {
  private reportService = inject(CommunicationReportService);
  private cacheService: ReportCacheService<cache> = inject(ReportCacheService);
  private pdfService = inject(PdfService);

  readonly CURRENT_DATE = new Date();
  readonly COLUMNS: tableProcedureColums[] = [
    { columnDef: 'group', header: 'Grupo' },
    { columnDef: 'code', header: 'Codigo' },
    { columnDef: 'reference', header: 'Referencia', width: '*' },
    { columnDef: 'person', header: 'Destinatario' },
    { columnDef: 'state', header: 'Estado' },
    { columnDef: 'createdAt', header: 'Fecha envio' },
  ] as const;

  filterForm: FormGroup = inject(FormBuilder).group({
    term: [''],
    startDate: [null, Validators.required],
    endDate: [this.CURRENT_DATE, Validators.required],
  });

  isLoading = signal<boolean>(false);
  hasSearched = signal(false);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  dataSource = signal<tableProcedureData[]>([]);
  dataSize = signal(0);

  constructor() {
    this.loadCache()
  }

  getData() {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.reportService
      .getHistory({
        limit: this.limit(),
        offset: this.offset(),
        ...this.filterForm.value,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(({ data, length }) => {
        this.dataSource.set(data);
        this.dataSize.set(length);

        this.cacheService.cache['report-history'] = {
          dataSource: data,
          form: this.filterForm.value,
          limit: this.limit(),
          index: this.index(),
          hasSearched:this.hasSearched(),
          dataSize: length,
        };
      });
  }

  generate() {
    this.index.set(0);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  clear() {
    this.filterForm.reset({});
  }

  print() {
    this.pdfService
      .tableSheet({
        title: 'Reporte: Historial de Envios',
        dataSource: this.dataSource().map(({ group, ...props }) => ({
          ...props,
          group: this.translateProcedureGroup(group),
        })),
        displayColumns: this.COLUMNS,
      })
      .subscribe((pdf) => {
        pdf.print({ autoPrint: true });
      });
  }

  private translateProcedureGroup(group: string) {
    switch (group) {
      case 'ExternalProcedure':
        return 'Externo';
      case 'InternalProcedure':
        return 'Interno';
      case 'ProcurementProcedure':
        return 'Contratacion';
      default:
        return 'Sin definir';
    }
  }

  private loadCache() {
    const cache = this.cacheService.cache['report-history'];
    if (!cache) return;
    this.filterForm.patchValue(cache.form)
    this.dataSource.set(cache.dataSource);
    this.dataSize.set(cache.dataSize);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
    this.hasSearched.set(cache.hasSearched)
  }
}
