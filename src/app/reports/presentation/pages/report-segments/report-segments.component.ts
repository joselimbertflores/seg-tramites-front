import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { map, Observable } from 'rxjs';

import { CommonReportService, ProcedureReportService } from '../../services';
import {
  GenericChartComponent,
  selectOption,
  SelectSearchComponent,
} from '../../../../shared';
import { procedureGroup, procedureState } from '../../../../procedures/domain';
import { totalProcedureBySegmentResponse } from '../../../infrastructure';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-segments',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    SelectSearchComponent,
    GenericChartComponent,
  ],
  template: `
    <div class="p-4">
      <div class="flex gap-6 items-center">
        <form
          [formGroup]="filterForm"
          class="flex-1 flex flex-col sm:flex-row gap-x-4 h-12"
        >
          <div class="w-full">
            <select-search
              [items]="institutions()"
              title="Institucion"
              (onSelect)="selectInstitution($event)"
            />
          </div>
          <div class="w-full">
            <mat-form-field>
              <mat-label>Grupo de tramite</mat-label>
              <mat-select formControlName="group">
                @for (group of PROCEDURE_GROUP; track $index) {
                <mat-option [value]="group.value">{{ group.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="w-full">
            <mat-form-field>
              <mat-label>Ingrese un rango</mat-label>
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
        </form>
        <div class="w-32">
          <button matButton="filled" (click)="getData()">Generar</button>
        </div>
      </div>
    </div>

    <!-- <div class="overflow-x-auto">
      <div class="p-1.5 min-w-full inline-block align-middle">
        <div class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-start font-medium">Segmento</th>
                @for (item of PROCEDURE_STATUS_LIST; track $index) {
                <th class="px-6 py-3 text-start font-medium">{{item.label}}</th>
                }
                <th class="px-6 py-3 text-start font-medium">Pendientes</th>
                <th class="px-6 py-3 text-start font-medium">Completados</th>
                <th class="px-6 py-3 text-start font-medium">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (item of results()?.segments; track $index) {
              <tr>
                <td class="px-6 py-4 font-medium">{{ item.prefix }}</td>
               
                <td class="px-6 py-4 bg-[#FAD2E1]">
                  {{ item.totals.pending }}
                </td>
                <td class="px-6 py-4 bg-[#BEE1E6]">
                  {{ item.totals.completed }}
                </td>
                <td class="px-6 py-4">{{ item.total }}</td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div> -->
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">
        Dashboard de Control - Institución:
        <!-- <span class="text-blue-600">{{ data.institutionId }}</span> -->
      </h1>

      <div class="bg-blue-100 p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold text-blue-800 mb-4">
          Totales Globales
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center bg-white p-4 rounded-md shadow-sm">
            <span class="text-xl font-medium text-gray-700 mr-2"
              >Pendientes:</span
            >
            <!-- <span class="text-2xl font-bold text-orange-500">{{
              data.globalTotals.pending
            }}</span> -->
          </div>
          <div class="flex items-center bg-white p-4 rounded-md shadow-sm">
            <span class="text-xl font-medium text-gray-700 mr-2"
              >Completados:</span
            >
            <!-- <span class="text-2xl font-bold text-green-600">{{
              data.globalTotals.completed
            }}</span> -->
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-800 mb-6">
        Detalle por Segmento
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ng-container
          *ngIf="results()?.segments ; else noSegments"
        >
          @for (segmentData of results()?.segments; track $index) {
          <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 class="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
              Segmento:
              <span class="text-purple-600">{{ segmentData.prefix }}</span>
            </h3>

            <div class="mb-4">
              <p class="text-lg font-semibold text-gray-600">
                Total General:
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
        </ng-container>
        <ng-template #noSegments>
          <p class="text-gray-600 col-span-full">
            No hay segmentos para mostrar.
          </p>
        </ng-template>
      </div>
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

  getData() {
    this.reportService
      .getTotalBySegments(this.filterForm.value)
      .subscribe((data) => {
        // console.log(data);
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
