import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { procedureGroup, procedureState } from '../../../../procedures/domain';
import { ProcedureReportService, ReportCacheService } from '../../services';
import { ReportProcedureTableComponent } from '../../components';
import { PdfService } from '../../../../shared';
import {
  tableProcedureColums,
  tableProcedureData,
} from '../../../infrastructure';

interface cache {
  datasource: tableProcedureData[];
  datasize: number;
  isAdvancedMode: boolean;
  hasSearched: boolean;
  form: object;
  limit: number;
  index: number;
}

@Component({
  selector: 'app-report-search',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    ReportProcedureTableComponent,
  ],
  templateUrl: './report-search.component.html',
  providers: [provideNativeDateAdapter()],
})
export default class ReportSearchComponent {
  private formBuilder = inject(FormBuilder);
  private reportService = inject(ProcedureReportService);
  private cacheService: ReportCacheService<cache> = inject(ReportCacheService);
  private pdfService = inject(PdfService);
  private destroyRef = inject(DestroyRef);

  isAdvancedMode = signal<boolean>(false);
  filterForm = computed<FormGroup>(() =>
    this.isAdvancedMode() ? this.createAdvancedForm() : this.createSimpleForm()
  );
  datasource = signal<tableProcedureData[]>([]);
  datasize = signal<number>(0);
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  isLoading = signal(false);
  hasSearched = signal(false);

  readonly COLUMNS: tableProcedureColums[] = [
    { columnDef: 'group', header: 'Grupo' },
    { columnDef: 'code', header: 'Codigo' },
    { columnDef: 'reference', header: 'Referencia', width: '*' },
    { columnDef: 'state', header: 'Estado' },
    { columnDef: 'createdAt', header: 'Fecha' },
  ] as const;

  readonly CURRENT_DATE = new Date();
  readonly GROUPS = [
    { label: 'Externos', value: procedureGroup.External },
    { label: 'Internos', value: procedureGroup.Internal },
    { label: 'Contrataciones', value: procedureGroup.Procurement },
  ] as const;

  readonly LABELS_MAP = {
    reference: 'Referencia',
    start: 'Fecha inicio',
    end: 'Fecha fin',
    state: 'Estado',
    group: 'Grupo',
    code: 'Codigo',
    type: 'Tipo',
    cite: 'Cite',
  } as const;

  readonly STATES = Object.values(procedureState).map((value) => value);

  title = this.cacheService.currentReport;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
  }

  ngOnInit(): void {
    this.loadCache();
  }

  getData() {
    if (this.filterForm().invalid) return;
    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.reportService
      .searchProcedureByProperties(
        this.limit(),
        this.offset(),
        this.filterForm().value
      )
      .subscribe({
        next: ({ procedures, length }) => {
          this.datasource.set(procedures);
          this.datasize.set(length);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  generate() {
    this.index.set(0);
    this.getData();
  }

  clear() {
    this.filterForm().reset({});
  }

  print() {
    this.pdfService
      .tableSheet({
        title: 'Reporte busqueda',
        dataSource: this.datasource().map(({ group, ...values }) => ({
          group: this.translateProcedureGroup(group),
          ...values,
        })),
        displayColumns: this.COLUMNS,
        filterParams: {
          params: {
            ...this.filterForm().value,
            group: this.GROUP_LABELS[this.filterForm().get('group')?.value],
          },
          labelsMap: this.LABELS_MAP,
        },
      })
      .subscribe((pdf) => {
        pdf.open();
      });
  }

  selectSearchMode(isAdvancedMode: boolean) {
    this.isAdvancedMode.set(isAdvancedMode);
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  get isFormValid() {
    return (
      this.filterForm().valid &&
      Object.values(this.filterForm().value).filter((value) => value).length >=
        2
    );
  }

  get GROUP_LABELS(): Record<string, string> {
    return this.GROUPS.reduce(
      (acc, { value, label }) => ({ ...acc, [value]: label }),
      {}
    );
  }

  private saveCache() {
    const cache: cache = {
      form: this.filterForm().value,
      isAdvancedMode: this.isAdvancedMode(),
      datasource: this.datasource(),
      datasize: this.datasize(),
      index: this.index(),
      limit: this.limit(),
      hasSearched: this.hasSearched(),
    };
    this.cacheService.saveCache('report-search', cache);
  }

  private loadCache() {
    const cache = this.cacheService.loadCache('report-search');
    if (!cache) return;
    this.isAdvancedMode.set(cache.isAdvancedMode);
    this.datasource.set(cache.datasource);
    this.filterForm().patchValue(cache.form);
    this.datasize.set(cache.datasize);
    this.index.set(cache.index);
    this.limit.set(cache.limit);
    this.hasSearched.set(cache.hasSearched);
  }

  private createSimpleForm(): FormGroup {
    return this.formBuilder.group({
      code: ['', Validators.minLength(4)],
      reference: ['', Validators.minLength(6)],
      group: ['', Validators.required],
    });
  }

  private createAdvancedForm(): FormGroup {
    return this.formBuilder.group({
      code: ['', Validators.minLength(4)],
      state: [''],
      reference: ['', Validators.minLength(6)],
      type: [''],
      start: [''],
      end: [this.CURRENT_DATE],
      group: ['', Validators.required],
      cite: [''],
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
