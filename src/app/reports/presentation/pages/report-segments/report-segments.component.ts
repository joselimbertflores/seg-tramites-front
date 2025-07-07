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
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { finalize, map, Observable } from 'rxjs';

import { procedureGroup, procedureState } from '../../../../procedures/domain';
import { CommonReportService, ProcedureReportService } from '../../services';
import { totalProcedureBySegmentResponse } from '../../../infrastructure';
import { selectOption, SelectSearchComponent } from '../../../../shared';

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
        <div class="space-y-4">
          <div class="shadow-sm border rounded-lg p-4">
            <h2 class="text-xl font-medium mb-4">Total Registros</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center  text-xl">
                <span class="mr-2">Pendientes:</span>
                <span class="font-bold text-orange-500">
                {{ results()?.globalTotals?.pending }}
              </span>
            </div>
            <div class="flex items-center text-xl">
              <span class="mr-2">Completados:</span>
              <span class="font-bold text-green-600">
                {{ results()?.globalTotals?.completed }}
              </span>
            </div>
          </div>
          </div>
          <div class="shadow-sm border rounded-lg p-4">
            <h2 class="text-xl font-medium mb-4">Detalle Segmento</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (segmentData of results()?.segments; track $index) {
                <div class="p-6 rounded-lg shadow-md border border-gray-200">
                  <h3 class="text-xl font-bold mb-4 border-b pb-2">
                    Segmento:
                    <span class="text-blue-600">{{ segmentData.prefix }}</span>
                  </h3>
                  
                  <div class="mb-4">
                    <p class="text-lg font-semibold">
                      Total:
                      <span class="text-indigo-700">{{ segmentData.total }}</span>
                    </p>
                    <div class="flex justify-between items-center mt-2">
                      <span class="text-md text-gray-600"
                      >Pendientes:
                      <span class="font-bold text-orange-500">{{
                        segmentData.totals.pending
                      }}</span></span
                      >
                      <span class="text-md text-gray-600"
                      >Completados:
                      <span class="font-bold text-green-600">{{
                        segmentData.totals.completed
                      }}</span></span
                      >
                    </div>
                  </div>
                  
                  <h4 class="text-lg font-semibold text-gray-700 mb-3">
                    Desglose por Estado:
                  </h4>
                  <ul class="space-y-2">
                    <li
                    *ngFor="let item of segmentData.breakdown"
                    class="flex justify-between items-center p-2 rounded-md"
                    [ngClass]="{
                      'bg-green-50 text-green-800': item.status === 'completed',
                      'bg-orange-50 text-orange-800': item.status === 'pending'
                    }"
                    >
                    <span class="font-medium">{{ item.state | titlecase }}</span>
                    <span class="font-bold text-lg">{{ item.count }}</span>
                  </li>
                </ul>
              </div>
                }
            </div>
          </div>
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

  getData() {
    this.isLoading.set(true);
    this.reportService
      .getTotalBySegments(this.filterForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((data) => {
        this.results.set(data);
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
