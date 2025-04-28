import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { ProcedureReportService } from '../../services/procedure-report.service';
import { procedureGroup, procedureState } from '../../../../procedures/domain';
import { ReportProcedureTableComponent } from '../../components';
import {
  tableProcedureColums,
  tableProcedureData,
} from '../../../infrastructure';
import {
  AlertMessageComponent,
  CacheService,
  PdfService,
} from '../../../../shared';

interface cache {
  datasource: tableProcedureData[];
  datasize: number;
  isAdvancedMode: boolean;
  hasSearched: boolean;
  form: Object;
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
    AlertMessageComponent,
    ReportProcedureTableComponent,
  ],
  templateUrl: './report-search.component.html',
  providers: [provideNativeDateAdapter()],
})
export default class ReportSearchComponent {
  private fb = inject(FormBuilder);
  private reportService = inject(ProcedureReportService);
  private cacheService: CacheService<cache> = inject(CacheService);
  private pdfService = inject(PdfService);

  isAdvancedMode = signal<boolean>(false);
  form = computed<FormGroup>(() =>
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

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.saveCache();
    });
  }

  ngOnInit(): void {
    this.loadCache();
  }

  getData() {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.reportService
      .searchProcedureByProperties(
        this.limit(),
        this.offset(),
        this.form().value
      )
      .subscribe({
        next: (resp) => {
          this.datasource.set(resp.procedures);
          this.datasize.set(resp.length);
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
    this.form().reset({});
  }

  print() {
    this.pdfService.procedureListSheet({
      title: 'Reporte busqueda',
      datasource: this.datasource().map(({ group, ...values }) => ({
        group: this.translateProcedureGroup(group),
        ...values,
      })),
      columns: this.COLUMNS,
      filterParams: {
        params: {
          ...this.form().value,
          group: this.GROUP_LABELS[this.form().get('group')?.value],
        },
        labelsMap: this.LABELS_MAP,
      },
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
      this.form().valid &&
      Object.values(this.form().value).filter((value) => value).length >= 2
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
      form: this.form().value,
      isAdvancedMode: this.isAdvancedMode(),
      datasource: this.datasource(),
      datasize: this.datasize(),
      index: this.index(),
      limit: this.limit(),
      hasSearched: this.hasSearched(),
    };
    this.cacheService.save('report-search', cache);
  }

  private loadCache() {
    const cache = this.cacheService.load('report-search');
    if (!cache) return;
    this.isAdvancedMode.set(cache.isAdvancedMode);
    this.datasource.set(cache.datasource);
    this.form().patchValue(cache.form);
    this.datasize.set(cache.datasize);
    this.index.set(cache.index);
    this.limit.set(cache.datasize);
    this.hasSearched.set(cache.hasSearched)
  }

  private createSimpleForm(): FormGroup {
    return this.fb.group({
      code: ['', Validators.minLength(4)],
      reference: ['', Validators.minLength(6)],
      group: ['', Validators.required],
    });
  }

  private createAdvancedForm(): FormGroup {
    return this.fb.group({
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
