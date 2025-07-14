import { CommonModule } from '@angular/common';
import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';

import {
  PdfService,
  selectOption,
  SelectSearchComponent,
} from '../../../../shared';

import {
  tableProcedureColums,
  tableProcedureData,
} from '../../../infrastructure';
import { ProcedureReportService, ReportCacheService } from '../../services';
import { ReportProcedureTableComponent } from '../../components';

type validReportType = 'applicant' | 'representative';
type typeApplicant = 'NATURAL' | 'JURIDICO';

interface cache {
  form: object;
  typeSearch: validReportType;
  typeApplicant: typeApplicant;
  datasource: tableProcedureData[];
  datasize: number;
  limit: number;
  index: number;
  typeProcedures: selectOption<typeProcedureOption>[];
  selectedTypeProcedure: typeProcedureOption | null;
  hasSearched: boolean;
}

interface typeProcedureOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-report-applicant',
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    SelectSearchComponent,
    ReportProcedureTableComponent,
  ],
  templateUrl: './report-applicant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportApplicantComponent {
  private formBuilder = inject(FormBuilder);
  private cacheService: ReportCacheService<cache> = inject(ReportCacheService);
  private reportService = inject(ProcedureReportService);
  private pdfService = inject(PdfService);

  typeSearch = signal<validReportType>('applicant');
  typeApplicant = signal<typeApplicant>('NATURAL');
  formApplicant = computed<FormGroup>(() => {
    if (this.typeSearch() === 'representative') {
      return this.formByApplicatNatural();
    }
    return this.typeApplicant() === 'NATURAL'
      ? this.formByApplicatNatural()
      : this.formByApplicatJuridico();
  });

  private readonly KEY_CACHE = 'report-applicant';

  typesProcedures = signal<selectOption<typeProcedureOption>[]>([]);
  selectedTypeProcedure = signal<typeProcedureOption | null>(null);

  datasource = signal<tableProcedureData[]>([]);
  datasize = signal<number>(0);
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  isLoading = signal(false);
  hasSearched = signal(false);

  readonly COLUMNS: tableProcedureColums[] = [
    { columnDef: 'code', header: 'Codigo', width: 80 },
    { columnDef: 'reference', header: 'Referencia', width: '*' },
    { columnDef: 'firstname', header: 'Nombre' },
    { columnDef: 'lastname', header: 'Apellido P.' },
    { columnDef: 'middlename', header: 'Apellido M.' },
    { columnDef: 'state', header: 'Estado', width:60 },
    { columnDef: 'createdAt', header: 'Fecha', width:70 },
  ] as const;

  readonly LABELS_MAP = {
    firstname: 'Nombre',
    middlename: 'Apellido Paterno',
    lastname: 'Apellido Materno',
    dni: 'Numero de CI.',
    phone: 'Telefono',
  } as const;

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
      .searchProcedureByApplicant({
        limit: this.limit(),
        offset: this.offset(),
        by: this.typeSearch(),
        form: {
          ...(this.typeSearch() === 'applicant' && {
            type: this.typeApplicant(),
          }),
          ...this.formApplicant().value,
        },
        typeProcedure: this.selectedTypeProcedure()?.id,
      })
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
    this.formApplicant().reset({});
    this.selectedTypeProcedure.set(null);
    this.typesProcedures.set([]);
  }

  changeTypeSearch(type: validReportType) {
    this.typeSearch.set(type);
    if (this.typeSearch() === 'representative') {
      this.typeApplicant.set('NATURAL');
    }
  }

  print() {
    this.pdfService
      .tableSheet({
        title: 'Reporte Solicitante',
        dataSource: this.datasource(),
        displayColumns: this.COLUMNS,
        filterParams: {
          params: {
            'Tipo de tramite': this.selectedTypeProcedure()?.name,
            'Busqueda por':
              this.typeSearch() === 'applicant'
                ? 'Solicitante'
                : 'Representante',
            'Tipo de solicitante': this.typeApplicant(),
            ...this.formApplicant().value,
          },
          labelsMap: this.LABELS_MAP,
        },
      })
      .subscribe((pdf) => {
        pdf.open();
      });
  }

  searchTypesProcedure(term: string) {
    this.reportService.getTypeProcedures(term).subscribe((values) => {
      this.typesProcedures.set(
        values.map(({ label, value }) => ({
          label: label,
          value: { id: value, name: label },
        }))
      );
    });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  get isFormValid() {
    return (
      Object.values(this.formApplicant().value).filter((value) => value)
        .length >= 1
    );
  }

  private formByApplicatNatural(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', [Validators.minLength(3)]],
      middlename: ['', [Validators.minLength(3)]],
      lastname: ['', [Validators.minLength(3)]],
      phone: ['', [Validators.minLength(6)]],
      dni: ['', [Validators.minLength(6)]],
    });
  }

  private formByApplicatJuridico(): FormGroup {
    return this.formBuilder.group({
      firstname: ['', [Validators.minLength(3)]],
      phone: ['', [Validators.minLength(6)]],
    });
  }

  private saveCache(): void {
    const cache: cache = {
      form: this.formApplicant().value,
      typeSearch: this.typeSearch(),
      typeApplicant: this.typeApplicant(),
      datasource: this.datasource(),
      datasize: this.datasize(),
      typeProcedures: this.typesProcedures(),
      selectedTypeProcedure: this.selectedTypeProcedure(),
      limit: this.limit(),
      index: this.index(),
      hasSearched: this.hasSearched(),
    };
    this.cacheService.saveCache(this.KEY_CACHE, cache);
  }

  private loadCache(): void {
    const cache = this.cacheService.loadCache(this.KEY_CACHE);
    if (!cache) return;
    this.datasource.set(cache.datasource);
    this.datasize.set(cache.datasize);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
    this.hasSearched.set(cache.hasSearched);
    this.typesProcedures.set(cache.typeProcedures);
    this.selectedTypeProcedure.set(cache.selectedTypeProcedure);

    // * Set config form by computed signal before patchValue
    this.typeSearch.set(cache.typeSearch);
    this.typeApplicant.set(cache.typeApplicant);
    this.formApplicant().patchValue(cache.form);
  }
}
