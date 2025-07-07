import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
import { ReportProcedureTableComponent } from '../../components';
import { CommunicationReportService } from '../../services';
import { PdfService } from '../../../../shared';

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
    ReportProcedureTableComponent,
  ],
  template: `
    <div class="p-4 space-y-6">
      <mat-accordion>
        <mat-expansion-panel expanded="true">
          <mat-expansion-panel-header>
            <mat-panel-title>PROPIEDADES FILTRO </mat-panel-title>
          </mat-expansion-panel-header>

          <form [formGroup]="filterForm">
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <mat-form-field appearance="outline">
                  <mat-label>Seleccione un rango</mat-label>
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
              <div>
                <mat-form-field>
                  <mat-label>Codigo</mat-label>
                  <input matInput formControlName="term" />
                </mat-form-field>
              </div>
            </div>
          </form>
          <mat-action-row>
            <button mat-icon-button (click)="print()">
              <mat-icon>print</mat-icon>
            </button>
            <button mat-button (click)="clear()">Limpiar</button>
            <button matButton="filled" (click)="generate()" [disabled]="isLoading()">Buscar</button>
          </mat-action-row>
        </mat-expansion-panel>
      </mat-accordion>

      @if(!isLoading() && dataSource().length > 0){
        <report-procedure-table [data]="dataSource()" [columns]="COLUMNS" />
        @if (limit() < dataSize()){
          <mat-paginator
            showFirstLastButtons
            [pageSizeOptions]="[10, 20, 30, 50]"
            [pageSize]="limit()"
            [pageIndex]="index()"
            [length]="dataSize()"
            (page)="onPageChange($event)"
          />
        } 
      } 
      @if(!isLoading() && hasSearched() && dataSource().length === 0){
        <div class="text-center p-8 text-lg">
          No se encontraron resultados para los filtros seleccionados.
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportHistoryCommunicationComponent {
  private reportService = inject(CommunicationReportService);
  private pdfService = inject(PdfService);

  readonly CURRENT_DATE = new Date();
  readonly COLUMNS: tableProcedureColums[] = [
    { columnDef: 'group', header: 'Grupo' },
    { columnDef: 'code', header: 'Codigo' },
    { columnDef: 'reference', header: 'Referencia', width: '*' },
    { columnDef: 'person', header: 'Destinatario' },
    { columnDef: 'createdAt', header: 'Fecha envio' },
  ] as const;

  filterForm: FormGroup = inject(FormBuilder).group({
    term: [''],
    startDate: [null],
    endDate: [this.CURRENT_DATE],
  });

  isLoading = signal<boolean>(false);
  hasSearched = signal(false);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  dataSource = signal<tableProcedureData[]>([]);
  dataSize = signal(0);

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
        dataSource: this.dataSource().map(({group,...props})=> ({...props, group:this.translateProcedureGroup(group)})),
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
}
