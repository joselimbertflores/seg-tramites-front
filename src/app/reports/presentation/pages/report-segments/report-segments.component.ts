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
  SelectSearchOption,
} from '../../../../shared';

interface cache {
  pieChartData: GeneriChartData;
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
    { label: 'Inscrito', value: procedureState.Inscrito },
    { label: 'En Revision', value: procedureState.Revision },
    { label: 'Observado', value: procedureState.Observado },
    { label: 'Concluido', value: procedureState.Concluido },
    { label: 'Abandonado', value: procedureState.Abandono },
    { label: 'Suspendido', value: procedureState.Suspendido },
    { label: 'Retirado', value: procedureState.Retirado },
    { label: 'Anulado', value: procedureState.Anulado },
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

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
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
          labels: ['Pendientes', 'Archivados'],
          datasets: [
            {
              data: [
                data.globalTotals.totalPending,
                data.globalTotals.totalCompleted,
              ],
              backgroundColor:["#FFD166", "#06D6A0"]
            },
          ],
        });
      });
  }

  selectInstitution(value: string) {
    this.filterForm.patchValue({ institutionId: value });
  }

  saveCache() {
    this.cacheService.saveCache('report-segments', {
      results: this.results(),
      pieChartData: this.pieChartData(),
    });
  }

  loadCache() {
    const cache = this.cacheService.loadCache('report-segments');
    if (!cache) return;
    this.results.set(cache.results);
    this.pieChartData.set(cache.pieChartData);
  }

  getCountState(
    state: procedureState,
    items: { state: procedureState; count: number }[]
  ) {
    return items.find((item) => item.state === state)?.count ?? 0;
  }

  getTotalByState(state: procedureState): number {
    return (
      this.results()?.segments.reduce((acc, seg) => {
        const found = seg.breakdown.find((b) => b.state === state);
        return acc + (found?.count ?? 0);
      }, 0) ?? 0
    );
  }

  private getInstitutionsSubscription(): Observable<SelectSearchOption<string>[]> {
    return this.commonReportService
      .getInstitutions()
      .pipe(
        map((resp) =>
          resp.map((item) => ({ value: item._id, label: item.nombre }))
        )
      );
  }
}
