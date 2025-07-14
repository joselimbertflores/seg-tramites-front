import {
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { finalize, map, Observable } from 'rxjs';

import { procedureGroup, procedureState } from '../../../../procedures/domain';
import {
  CommonReportService,
  ProcedureReportService,
  ReportCacheService,
} from '../../services';
import { totalProcedureBySegmentResponse } from '../../../infrastructure';
import {
  GenericChartComponent,
  SelectSearchComponent,
  GeneriChartData,
  selectOption,
} from '../../../../shared';

interface cache {
  pieChartData: GeneriChartData;
  barChartData: GeneriChartData;
  results: totalProcedureBySegmentResponse | null;
}
@Component({
  selector: 'app-report-segments',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    SelectSearchComponent,
    MatProgressBarModule,
    GenericChartComponent,
  ],
  templateUrl: './report-segments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportSegmentsComponent {
  private destroyRef = inject(DestroyRef);
  private reportService = inject(ProcedureReportService);
  private commonReportService = inject(CommonReportService);
  private cacheService: ReportCacheService<cache> = inject(ReportCacheService);

  readonly institutions = toSignal(this.getInstitutionsSubscription(), {
    initialValue: [],
  });

  readonly CURRENT_DATE = new Date();
  readonly PROCEDURE_GROUP = [
    { label: 'Tramites Externos', value: procedureGroup.External },
    { label: 'Tramites Internos', value: procedureGroup.Internal },
    { label: 'Tramites de Contrataciones', value: procedureGroup.Procurement },
  ];
  readonly PROCEDURE_STATUS_LIST = [
    { label: 'Anulado', value: procedureState.Anulado },
    { label: 'Concluido', value: procedureState.Concluido },
    { label: 'Archivado', value: procedureState.Inscrito },
    { label: 'Observadors', value: procedureState.Observado },
    { label: 'En Revision', value: procedureState.Revision },
    { label: 'Suspendido', value: procedureState.Suspendido },
  ];

  filterForm: FormGroup = inject(FormBuilder).group({
    institutionId: ['', Validators.required],
    group: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: [this.CURRENT_DATE, Validators.required],
  });

  results = signal<totalProcedureBySegmentResponse | null>(null);
  isLoading = signal(false);

  pieChartData = signal<GeneriChartData>({
    labels: [],
    datasets: [],
  });

  barChartData = signal<GeneriChartData>({
    labels: [],
    datasets: [],
  });

  constructor() {
    this.destroyRef.onDestroy(()=>{
      this.saveCache()
    })
  }

  ngOnInit(): void {
    this.loadCache();
  }

  getData() {
    this.isLoading.set(true);
    this.reportService
      .getTotalBySegments(this.filterForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((data) => {
        this.results.set(data);
        this.pieChartData.set({
          labels: ['Pendientes', 'Finalizados'],
          datasets: [
            {
              data: [
                data.globalTotals.totalPending,
                data.globalTotals.totalCompleted,
              ],
            },
          ],
        });
        this.barChartData.set({
          labels: Object.values(procedureState),
          datasets: data.segments.map((item) => ({
            label: item.prefix,
            data: item.breakdown.map((value) => value.count),
          })),
        });
      });
  }

  selectInstitution(value: string) {
    this.filterForm.patchValue({ institutionId: value });
  }

  private getInstitutionsSubscription(): Observable<selectOption<string>[]> {
    return this.commonReportService
      .getInstitutions()
      .pipe(
        map((resp) =>
          resp.map((item) => ({ value: item._id, label: item.nombre }))
        )
      );
  }

  saveCache() {
    this.cacheService.saveCache('report-segments', {
      results: this.results(),
      pieChartData: this.pieChartData(),
      barChartData: this.barChartData(),
    });
  }

  loadCache() {
    const cache = this.cacheService.loadCache('report-segments');
    if (!cache) return;
    this.results.set(cache.results);
    this.pieChartData.set(cache.pieChartData);
    this.barChartData.set(cache.barChartData);
  }
}
