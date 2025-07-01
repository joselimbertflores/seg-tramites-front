import { CommonModule } from '@angular/common';
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
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { finalize, map } from 'rxjs';

import {
  PdfService,
  selectOption,
  SelectSearchComponent,
  AlertMessageComponent,
} from '../../../../shared';

import { procedureGroup } from '../../../../procedures/domain';
import { sendStatus } from '../../../../communications/domain';
import {
  CommonReportService,
  CommunicationReportService,
} from '../../services';
import {
  dependency,
  institution,
} from '../../../../administration/infrastructure';

@Component({
  selector: 'app-report-unit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressBarModule,
    AlertMessageComponent,
    SelectSearchComponent,
  ],
  template: `
    <div class="p-2 sm:p-4">
      <div class="flex flex-col gap-y-6">
        <mat-accordion>
          <mat-expansion-panel expanded="true">
            <mat-expansion-panel-header>
              <mat-panel-title>PARAMENTROS BUSQUEDA </mat-panel-title>
            </mat-expansion-panel-header>
            <form [formGroup]="form" class="mt-2">
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div>
                  <select-search
                    [items]="institutions()"
                    title="Institucion"
                    [required]="true"
                    placeholder="Seleccione una institucion"
                    (onSelect)="onSelectInstitution($event)"
                  />
                </div>
                <div class="sm:col-span-2">
                  <select-search
                    [items]="dependencies()"
                    title="Dependencia"
                    [required]="true"
                    placeholder="Seleccione una deoendencia"
                    (onSelect)="onSelectDependency($event)"
                  />
                </div>
                <div>
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
                <div>
                  <mat-form-field>
                    <mat-label>Grupo tramite</mat-label>
                    <mat-select formControlName="group">
                      @for (item of procedureGroups; track $index) {
                      <mat-option [value]="item.value">{{
                        item.label
                      }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </form>
            <mat-action-row>
              <button mat-icon-button (click)="print()">
                <mat-icon>print</mat-icon>
              </button>
              <button mat-button (click)="clear()">Limpiar</button>
              <button
                mat-button
                [disabled]="isLoading() || form.invalid"
                (click)="generate()"
              >
                Buscar
              </button>
            </mat-action-row>
          </mat-expansion-panel>
        </mat-accordion>

        <p class="text-xl tracking-wide">Resultados</p>

        @if(isLoading()){
        <div class="px-6 py-2">
          <mat-progress-bar mode="indeterminate" />
        </div>
        } @if(!isLoading() && hasSearched() && dataSource().length === 0){
        <alert-message
          severity="warning"
          title="Sin resultados"
          message="Revise los paremetros ingresados"
        />
        } @if(!isLoading() && !hasSearched()){
        <div
          class="p-3 rounded-md"
          style="background-color: var(--mat-sys-surface-container-high);"
        >
          💡<span class="ml-2 text-base leading-6"
            >Seleccione el rango y el tipo de correspondencia</span
          >
        </div>
        } @if(!isLoading() && dataSource().length > 0){
        <table mat-table [dataSource]="dataSource()">
          <ng-container matColumnDef="officer">
            <th mat-header-cell *matHeaderCellDef>Usuario</th>
            <td mat-cell *matCellDef="let element">
              <div class="block font-medium text-base">
                @if(element.fullName){
                {{ element.fullName | titlecase }}
                } @else {
                <span class="text-red-600">Sin asignar</span>
                }
              </div>
              <div class="block text-xs">{{ element.jobTitle }}</div>
            </td>
          </ng-container>

          @for (column of statusColumnsToDisplay; track $index) {
          <ng-container [matColumnDef]="column.columnDef">
            <th mat-header-cell *matHeaderCellDef>{{ column.header }}</th>
            <td mat-cell *matCellDef="let element" class="w-32">
              {{ element[column.columnDef] }}
            </td>
          </ng-container>
          }

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let element">{{ element.total }}</td>
          </ng-container>

          <ng-container matColumnDef="options">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let element" class="w-44">
              <button matButton (click)="getInbox(element)">
                <mat-icon>print</mat-icon>
                Pendientes
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportUnitComponent {
  private reportService = inject(CommunicationReportService);
  private commonService = inject(CommonReportService);
  private pdfService = inject(PdfService);
  private formBuilder = inject(FormBuilder);

  readonly PROCEDURE_GROUP_MAP = {
    [procedureGroup.External]: 'Tramites Externos',
    [procedureGroup.Internal]: 'Tramites Internos',
    [procedureGroup.Procurement]: 'Tramites de Contrataciones',
  };

  readonly statusColumnsToDisplay = [
    { columnDef: sendStatus.Pending, header: 'Pendientes' },
    { columnDef: sendStatus.Received, header: 'Recibidos' },
    { columnDef: sendStatus.Rejected, header: 'Rechazados' },
    { columnDef: sendStatus.Archived, header: 'Archivados' },
  ];
  readonly currentDate = new Date();

  displayedColumns: string[] = [
    'officer',
    ...this.statusColumnsToDisplay.map((item) => item.columnDef),
    'total',
    'options',
  ];
  dataSource = signal<object[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);

  form: FormGroup = this.formBuilder.group({
    dependencyId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: [this.currentDate, Validators.required],
    group: [null],
  });

  institutions = toSignal(this.getInstitutions(), { initialValue: [] });
  dependencies = signal<selectOption<dependency>[]>([]);

  searcProperties: Record<string, string> = {};

  getData() {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.reportService
      .getTotalByUnit(this.form.value)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe((resp) => {
        this.dataSource.set(resp);
      });
  }

  generate() {
    this.getData();
  }

  print() {
    this.pdfService.tableReportShet({
      title: 'Reporte "Pendientes por Unidad"',
      datasource: this.dataSource(),
      columns: [
        { columnDef: 'fullName', header: 'Funcionario', width: '*' },
        { columnDef: 'jobTitle', header: 'Cargo', width: '*' },
        ...this.statusColumnsToDisplay,
        { columnDef: 'total', header: 'Total' },
      ],
      filterParams: {
        params: { ...this.form.value, ...this.searcProperties },
        labelsMap: {
          group: 'Grupo',
          endDate: 'Fecha fin',
          startDate: 'Fecha inicio',
          dependencyId: 'Dependencia',
        },
        valuesMap: {
          group: this.PROCEDURE_GROUP_MAP,
        },
      },
    });
  }

  getInbox(account: { id: string; fullName?: string; jobTitle: string }) {
    this.reportService.getInboxByAccount(account.id).subscribe((data) => {
      this.pdfService.tableReportShet({
        title: 'Reporte "Dependientes" - Bandeja de entrada',
        datasource: data,
        columns: [
          { columnDef: 'senderFullName', header: 'Emisor' },
          { columnDef: 'code', header: 'Alterno' },
          { columnDef: 'reference', header: 'Refenrecia', width: '*' },
          { columnDef: 'sentDate', header: 'Fecha envio' },
          { columnDef: 'received', header: 'Recibido' },
        ],
        filterParams: {
          params: {
            Funcionario: `${account.fullName ?? 'SIN ASIGNAR'}  --  ${
              account.jobTitle
            }`,
          },
        },
      });
    });
  }

  onSelectInstitution(option: institution): void {
    this.commonService
      .getDependencies(option._id)
      .pipe(
        map((resp) => resp.map((item) => ({ value: item, label: item.nombre })))
      )
      .subscribe((resp) => {
        this.dependencies.set(resp);
        this.searcProperties['Institucion'] = option.nombre;
      });
  }

  onSelectDependency(option: dependency): void {
    this.form.patchValue({ dependencyId: option._id });
    this.searcProperties['dependencyId'] = option.nombre;
  }

  clear() {
    this.form.reset();
  }

  get procedureGroups() {
    return Object.entries(this.PROCEDURE_GROUP_MAP).map(([value, label]) => ({
      value,
      label,
    }));
  }

  private getInstitutions() {
    return this.commonService
      .getInstitutions()
      .pipe(
        map((resp) => resp.map((item) => ({ value: item, label: item.nombre })))
      );
  }
}
