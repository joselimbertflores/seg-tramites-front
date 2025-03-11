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
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PaginatorComponent,
  ReportProcedureTableComponent,
} from '../../../components';

import { MaterialModule } from '../../../../material.module';

type validReportType = 'solicitante' | 'representante';
type typeApplicant = 'NATURAL' | 'JURIDICO';

interface CacheData {
  form: Object;
  typeSearch: validReportType;
  typeApplicant: typeApplicant;
  data: any[];
  size: number;
}

@Component({
  selector: 'app-report-applicant',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ReportProcedureTableComponent,
    PaginatorComponent,
  ],
  templateUrl: './report-applicant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportApplicantComponent {
  private fb = inject(FormBuilder);
  // private cacheService: CacheService<CacheData> = inject(CacheService);
  // private reportService = inject(ReportService);
  // private pdfService = inject(PdfService);

  public typeSearch = signal<validReportType>('solicitante');
  public typeApplicant = signal<typeApplicant>('NATURAL');
  public FormApplicant = computed<FormGroup>(() => {
    if (this.typeSearch() === 'representante') {
      return this.FormByRepresentative();
    }
    return this.typeApplicant() === 'NATURAL'
      ? this.FormByApplicatNatural()
      : this.FormByApplicatJuridico();
  });
  public datasource = signal<any[]>([]);
  public datasize = signal<number>(0);
  public displaycolums: any[] = [
    { columnDef: 'code', header: 'Alterno' },
    { columnDef: 'reference', header: 'Referencia' },
    { columnDef: 'state', header: 'Estado' },
    { columnDef: 'applicant', header: 'Solicitante' },
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

  generate() {
    const isFormEmpty = Object.values(this.FormApplicant().value).every(
      (val) => val === ''
    );
    if (isFormEmpty) return;
    // this.cacheService.resetPagination();
    this.getData();
  }

  clear() {
    // this.cacheService.resetPagination();
    this.datasize.set(0);
    this.datasource.set([]);
    this.FormApplicant().reset({});
  }

  getData() {
    // this.reportService
    //   .searchProcedureByApplicant({
    //     limit: this.limit,
    //     offset: this.offset,
    //     by: this.typeSearch(),
    //     form: {
    //       ...(this.typeSearch() === 'solicitante' && {
    //         tipo: this.typeApplicant(),
    //       }),
    //       ...this.FormApplicant().value,
    //     },
    //   })
    //   .subscribe((resp) => {
    //     this.datasource.set(resp.procedures);
    //     this.datasize.set(resp.length);
    //   });
  }

  changePage(params: { limit: number; index: number }) {
    // this.cacheService.pageSize.set(params.limit);
    // this.cacheService.pageIndex.set(params.index);
    this.getData();
  }

  changeTypeSearch(type: validReportType) {
    this.typeSearch.set(type);
    if (this.typeSearch() === 'representante') {
      this.typeApplicant.set('NATURAL');
    }
  }

  print() {
    // this.pdfService.GenerateReportSheet({
    //   title: 'Reporte solicitante',
    //   results: this.datasource(),
    //   columns: this.displaycolums,
    //   parameters: this.FormApplicant().value,
    // });
  }

  private FormByApplicatNatural(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.minLength(3)]],
      paterno: ['', [Validators.minLength(3)]],
      materno: ['', [Validators.minLength(3)]],
      telefono: ['', [Validators.minLength(6)]],
      dni: ['', [Validators.minLength(6)]],
    });
  }

  private FormByApplicatJuridico(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.minLength(3)]],
      telefono: ['', [Validators.minLength(6)]],
    });
  }

  private FormByRepresentative(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.minLength(3)]],
      paterno: ['', [Validators.minLength(3)]],
      materno: ['', [Validators.minLength(3)]],
      telefono: ['', [Validators.minLength(6)]],
      dni: ['', [Validators.minLength(6)]],
    });
  }

  private savePaginationData(): void {
    // this.cacheService.resetPagination();
    const cache = {
      form: this.FormApplicant().value,
      typeSearch: this.typeSearch(),
      typeApplicant: this.typeApplicant(),
      data: this.datasource(),
      size: this.datasize(),
    };
    // this.cacheService.save('report-applicant', cache);
  }

  private loadPaginationData(): void {
    // const cacheData = this.cacheService.load('report-applicant');
    // if (!this.cacheService.keepAliveData() || !cacheData) return;
    // this.datasource.set(cacheData.data);
    // this.datasize.set(cacheData.size);
    // this.typeApplicant.set(cacheData.typeApplicant);
    // this.typeSearch.set(cacheData.typeSearch);
    // this.FormApplicant().patchValue(cacheData.form);
  }

  get limit() {
    return 0;
  }
  get offset() {
    return 0;
  }
  get index() {
    return 0;
  }
}
