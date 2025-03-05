import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  PaginatorComponent,
  ReportProcedureTableComponent,
  ServerSelectSearchComponent,
} from '../../../components';
import { PdfService, ReportService } from '../../../services';
import { StateProcedure } from '../../../../domain/models';
import {
  TableProcedureColums,
  TableProcedureData,
} from '../../../../infraestructure/interfaces';
import { MaterialModule } from '../../../../material.module';

type SearchMode = 'simple' | 'advanced';

interface CacheData {
  form: Object;
  types: SelectOptiom[];
  data: TableProcedureData[];
  size: number;
  searchMode: SearchMode;
}

interface SelectOptiom {
  text: string;
  value: string;
}

@Component({
  selector: 'app-report-search',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    PaginatorComponent,
    ReportProcedureTableComponent,
    ServerSelectSearchComponent,
  ],
  templateUrl: './report-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSearchComponent {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private pdfService = inject(PdfService);
  // private cacheService: CacheService<CacheData> = inject(CacheService);

  public searchMode = signal<SearchMode>('simple');
  public typeProcedures = signal<SelectOptiom[]>([]);
  public FormProcedure = computed<FormGroup>(() => {
    return this.searchMode() === 'simple'
      ? this.createSimpleForm()
      : this.createAdvancedForm();
  });
  public datasource = signal<TableProcedureData[]>([]);
  public datasize = signal<number>(0);
  public displaycolums: TableProcedureColums[] = [
    { columnDef: 'code', header: 'Alterno' },
    { columnDef: 'reference', header: 'Referencia' },
    { columnDef: 'state', header: 'Estado' },
    { columnDef: 'startDate', header: 'Fecha' },
  ];

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.savePaginationData();
    });
  }

  ngOnInit(): void {
    this.loadPaginationData();
  }

  getData() {
    this.reportService
      .searchProcedureByProperties(
        this.limit,
        this.offset,
        this.FormProcedure().value
      )
      .subscribe((resp) => {
        this.datasource.set(resp.procedures);
        this.datasize.set(resp.length);
      });
  }

  generate() {
    const { end, group, ...props } = this.FormProcedure().value;
    const isFormEmpty = Object.values(props).every((val) => val === '' || !val);
    if (isFormEmpty) return;
    // this.cacheService.pageIndex.set(0);
    this.getData();
  }

  clear() {
    this.FormProcedure().reset({});
    this.datasource.set([]);
    this.datasize.set(0);
    this.typeProcedures.set([]);
  }

  print() {
    this.pdfService.GenerateReportSheet({
      title: 'Reporte busqueda',
      results: this.datasource(),
      columns: this.displaycolums,
    });
  }

  searchTypesProcedures(term: string) {
    this.reportService
      .getTypeProceduresByText(term, this.FormProcedure().get('group')?.value)
      .subscribe((types) => {
        this.typeProcedures.set(
          types.map((el) => ({ value: el._id, text: el.nombre }))
        );
      });
  }

  setTypeProcedure(id_type: string = '') {
    this.FormProcedure().get('type')?.setValue(id_type);
  }

  changePage(params: { limit: number; index: number }) {
    // this.cacheService.pageSize.set(params.limit);
    // this.cacheService.pageIndex.set(params.index);
    this.getData();
  }

  selectSearchMode(value: SearchMode) {
    this.searchMode.set(value);
  }

  changeGroupProcedure() {
    this.FormProcedure().patchValue({ type: '' });
    this.typeProcedures.set([]);
  }

  private savePaginationData() {
    // this.cacheService.resetPagination();
    const cache: CacheData = {
      form: this.FormProcedure().value,
      types: this.typeProcedures(),
      data: this.datasource(),
      size: this.datasize(),
      searchMode: this.searchMode(),
    };
    // this.cacheService.save('report-search', cache);
  }

  private loadPaginationData() {
    // const cacheData = this.cacheService.load('report-search');
    // if (!this.cacheService.keepAliveData() || !cacheData) return;
    // this.searchMode.set(cacheData.searchMode);
    // this.typeProcedures.set(cacheData.types);
    // this.datasource.set(cacheData.data);
    // this.datasize.set(cacheData.size);
    // this.FormProcedure().patchValue(cacheData.form);
  }

  private createSimpleForm(): FormGroup {
    return this.fb.group({
      code: ['', Validators.minLength(4)],
      reference: [''],
      group: [''],
    });
  }

  private createAdvancedForm(): FormGroup {
    return this.fb.group({
      code: ['', Validators.minLength(4)],
      state: [''],
      reference: [''],
      type: [''],
      start: [''],
      end: [new Date()],
      group: [''],
      cite: [''],
    });
  }

  get states() {
    return Object.values(StateProcedure);
  }

  get limit() {
    return 0
  }
  get offset() {
    return 0
  }
  get index() {
    return 0
  }
}
