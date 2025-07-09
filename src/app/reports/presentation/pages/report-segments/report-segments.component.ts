import {
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
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
import { CommonReportService, ProcedureReportService } from '../../services';
import { totalProcedureBySegmentResponse } from '../../../infrastructure';
import {
  GenericChartComponent,
  SelectSearchComponent,
  GeneriChartData,
  selectOption,
} from '../../../../shared';

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
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-medium mb-6">Reporte: Total por Segmentos</h1>
      <form [formGroup]="filterForm" (ngSubmit)="getData()" class="mb-4 p-4">
        <div class="flex flex-col sm:flex-row gap-x-4 gap-y-4">
          <div class="w-full sm:w-1/3">
            <select-search
              title="Institucion"
              [items]="institutions()"
              (onSelect)="selectInstitution($event)"
            />
          </div>
          <div class="w-full sm:w-1/3">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Grupo de Trámite</mat-label>
              <mat-select formControlName="group">
                @for (group of PROCEDURE_GROUP; track $index) {
                <mat-option [value]="group.value">{{ group.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="w-full sm:w-1/3">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Ingrese un rango de fechas</mat-label>
              <mat-date-range-input [rangePicker]="picker">
                <input
                  matStartDate
                  placeholder="Fecha inicio"
                  formControlName="startDate"
                />
                <input
                  matEndDate
                  placeholder="Fecha fin"
                  formControlName="endDate"
                />
              </mat-date-range-input>
              <mat-datepicker-toggle
                matIconSuffix
                [for]="picker"
              ></mat-datepicker-toggle>
              <mat-date-range-picker #picker></mat-date-range-picker>
            </mat-form-field>
          </div>
        </div>
        <div class="mt-2 text-right">
          <button
            matButton="filled"
            [disabled]="filterForm.invalid || isLoading()"
            (click)="getData()"
          >
            Generar Reporte
          </button>
        </div>
      </form>

      @if(isLoading()){
        <div class="flex flex-col gap-y-1">
          <p class="text-xl">Generando reporte....</p>
          <mat-progress-bar mode="indeterminate" />
        </div>
      } 
      
      @if(!isLoading() && results()?.segments?.length === 0){
        <div class="text-center p-8 text-lg">
          No se encontraron datos para los filtros seleccionados.
        </div>
      }   
      @if(!isLoading() && (results()?.segments?.length ?? 0) > 0){
        <div class="mx-auto w-full sm:w-[500px] mb-6">
          <generic-chart
            title="Porcentaje Total de Trámites"
            chartType="pie"
            [chartData]="pieChartData()"
          />
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y-2 divide-gray-200">
            <thead>
              <tr>
                <th class="px-3 py-2 whitespace-nowrap text-start">SEGMENTO</th>
                <th class="px-3 py-2 whitespace-nowrap text-start">PENDIENTES</th>
                <th class="px-3 py-2 whitespace-nowrap text-start">
                  FINALIZADOS
                </th>
                <th class="px-3 py-2 whitespace-nowrap text-start">TOTAL</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              @for (item of results()?.segments; track $index) {
              <tr class="*:text-gray-900 *:first:font-medium">
                <td class="px-3 py-2 whitespace-nowrap">{{ item.prefix }}</td>
                <td class="px-3 py-2 whitespace-nowrap">
                  {{ item.totals.pending }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap">
                  {{ item.totals.completed }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap">{{ item.total }}</td>
              </tr>
              }
            </tbody>
            <tfoot>
              <tr class="*:font-semibold *:px-3 *:py-2 *:text-gray-800">
                <td class="text-left">TOTAL:</td>
                <td class="text-left">
                  {{ results()?.globalTotals?.totalPending }}
                </td>
                <td class="text-left">
                  {{ results()?.globalTotals?.totalCompleted }}
                </td>
                <td>{{ results()?.globalTotals?.total }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportSegmentsComponent {
  private reportService = inject(ProcedureReportService);
  private commonReportService = inject(CommonReportService);

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
}
