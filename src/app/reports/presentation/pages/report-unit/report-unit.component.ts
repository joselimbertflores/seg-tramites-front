import { CommonModule } from '@angular/common';
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
import { finalize, map, switchMap } from 'rxjs';

import {
  PdfService,
  selectOption,
  SelectSearchComponent,
} from '../../../../shared';

import { procedureGroup } from '../../../../procedures/domain';
import { sendStatus } from '../../../../communications/domain';
import {
  ReportCacheService,
  CommonReportService,
  CommunicationReportService,
} from '../../services';
import {
  dependency,
  institution,
} from '../../../../administration/infrastructure';

interface cache {
  dataSource: object[];
  form: object;
  hasSearched: boolean;
  dependencies: selectOption<dependency>[];
  selectedInstitution: institution | null;
  selectedDependency: dependency | null;
}
@Component({
  selector: 'app-report-unit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    SelectSearchComponent,
  ],
  templateUrl: './report-unit.component.html',
  styles: `
    tr.mat-mdc-footer-row td {
      font-weight: bold;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportUnitComponent {
  private destroyRef = inject(DestroyRef);
  private reportService = inject(CommunicationReportService);
  private commonService = inject(CommonReportService);
  private cacheService: ReportCacheService<cache> = inject(ReportCacheService);
  private pdfService = inject(PdfService);
  private formBuilder = inject(FormBuilder);

  readonly PROCEDURE_GROUP_MAP = {
    [procedureGroup.External]: 'Tramites Externos',
    [procedureGroup.Internal]: 'Tramites Internos',
    [procedureGroup.Procurement]: 'Tramites de Contrataciones',
  };

  readonly FILTER_OPTIONS = [
    { value: 'recipient', label: 'Enviados a la unidad seleccionada' },
    { value: 'sender', label: 'Enviados desde la unidad seleccionada' },
  ];

  readonly statusColumnsToDisplay = [
    { columnDef: sendStatus.Pending, header: 'Pendientes' },
    { columnDef: sendStatus.Received, header: 'Recibidos' },
    { columnDef: sendStatus.Rejected, header: 'Rechazados' },
    { columnDef: sendStatus.AutoRejected, header: 'Auto Rechazados' },
    { columnDef: sendStatus.Forwarding, header: 'Reenviados' },
    { columnDef: sendStatus.Completed, header: 'Completados' },
  ];
  readonly CURRENT_DATE = new Date();

  displayedColumns: string[] = [
    'officer',
    ...this.statusColumnsToDisplay.map((item) => item.columnDef),
    'total',
    'options',
  ];
  dataSource = signal<object[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);
  isLoadingInbox = signal(false);

  form: FormGroup = this.formBuilder.group({
    dependencyId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: [this.CURRENT_DATE, Validators.required],
    filterBy: ['recipient', Validators.required],
    group: [null],
  });

  institutions = toSignal(this.getInstitutions(), { initialValue: [] });
  dependencies = signal<selectOption<dependency>[]>([]);
  selectedInstitution = signal<institution | null>(null);
  selectedDependency = signal<dependency | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
  }

  ngOnInit(): void {
    this.loadCache();
  }

  getData() {
    if (this.form.invalid) return;
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
    this.pdfService
      .tableSheet({
        title: 'Reporte "Pendientes por Unidad"',
        dataSource: this.dataSource(),
        displayColumns: [
          { columnDef: 'fullName', header: 'Funcionario', width: '*' },
          { columnDef: 'jobTitle', header: 'Cargo', width: '*' },
          ...this.statusColumnsToDisplay,
          { columnDef: 'total', header: 'Total' },
        ],
        filterParams: {
          params: {
            ...{ institucion: this.selectedInstitution()?.nombre },
            ...this.form.value,
            group:
              this.PROCEDURE_GROUP_MAP[
                this.form.get('group')?.value as procedureGroup
              ] ?? null,
            dependencyId: this.selectedDependency()?.nombre,
          },
          labelsMap: {
            group: 'Grupo',
            endDate: 'Fecha fin',
            startDate: 'Fecha inicio',
            dependencyId: 'Dependencia',
          },
        },
      })
      .subscribe((pdf) => {
        pdf.open();
      });
  }

  getInbox(account: { id: string; fullName?: string; jobTitle: string }) {
    this.isLoadingInbox.set(true);
    this.reportService
      .getInboxByAccount(account.id)
      .pipe(
        switchMap((data) => {
          return this.pdfService.tableSheet({
            title: 'Reporte "Pendientes por Unidad" - Bandeja de entrada',
            dataSource: data,
            displayColumns: [
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
        }),
        finalize(() => this.isLoadingInbox.set(false))
      )
      .subscribe((pdf) => {
        pdf.open();
      });
  }

  onSelectInstitution(option: institution | null): void {
    if (!option) return;
    this.selectedInstitution.set(option);
    this.commonService
      .getDependencies(option!._id)
      .pipe(
        map((resp) => resp.map((item) => ({ value: item, label: item.nombre })))
      )
      .subscribe((resp) => {
        this.dependencies.set(resp);
      });
  }

  onSelectDependency(option: dependency | null): void {
    if (!option) return;
    this.form.patchValue({ dependencyId: option._id });
    this.selectedDependency.set(option);
  }

  clear() {
    this.form.reset();
    this.selectedDependency.set(null);
    this.selectedInstitution.set(null);
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

  private saveCache(): void {
    this.cacheService.saveCache('report-unit', {
      dataSource: this.dataSource(),
      dependencies: this.dependencies(),
      hasSearched: this.hasSearched(),
      selectedInstitution: this.selectedInstitution(),
      selectedDependency: this.selectedDependency(),
      form: this.form.value,
    });
  }

  private loadCache(): void {
    const cache = this.cacheService.loadCache('report-unit');
    if (!cache) return;
    this.dataSource.set(cache.dataSource);
    this.selectedInstitution.set(cache.selectedInstitution);
    this.selectedDependency.set(cache.selectedDependency);
    this.dependencies.set(cache.dependencies);
    this.form.patchValue(cache.form);
    this.hasSearched.set(cache.hasSearched);
  }

  getTotalByProperty(property: string) {
    return this.dataSource()
      .map((item: any) => item[property])
      .reduce((acc, value) => acc + value, 0);
  }
}
