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
  AlertMessageComponent,
  SelectSearchComponent,
  CacheService,
  PdfService,
  selectOption,
} from '../../../../shared';
import { ProcedureReportService } from '../../services/procedure-report.service';
import {
  tableProcedureColums,
  tableProcedureData,
} from '../../../infrastructure';
import { ReportProcedureTableComponent } from '../../components';

type validReportType = 'applicant' | 'representative';
type typeApplicant = 'NATURAL' | 'JURIDICO';

interface cache {
  form: Object;
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
    AlertMessageComponent,
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
  private cacheService: CacheService<cache> = inject(CacheService);
  private reportService = inject(ProcedureReportService);
  private pdfService = inject(PdfService);

  public typeSearch = signal<validReportType>('applicant');
  public typeApplicant = signal<typeApplicant>('NATURAL');
  public formApplicant = computed<FormGroup>(() => {
    if (this.typeSearch() === 'representative') {
      return this.formByApplicatNatural();
    }
    return this.typeApplicant() === 'NATURAL'
      ? this.formByApplicatNatural()
      : this.formByApplicatJuridico();
  });

  private readonly KEY_CACHE = 'report-applicant';

  typeProcedures = signal<selectOption<typeProcedureOption>[]>([]);
  selectedTypeProcedure = signal<typeProcedureOption | null>(null);

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
    { columnDef: 'person', header: 'Solicitante' },
    { columnDef: 'state', header: 'Estado' },
    { columnDef: 'createdAt', header: 'Fecha' },
  ] as const;

  readonly LABELS_MAP = {
    firstname: 'Nombre',
    middlename: 'Apellido Paterno',
    lastname: 'Apellido Materno',
    dni: 'Dni',
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
    this.typeProcedures.set([]);
  }

  changeTypeSearch(type: validReportType) {
    this.typeSearch.set(type);
    if (this.typeSearch() === 'representative') {
      this.typeApplicant.set('NATURAL');
    }
  }

  print() {
    this.pdfService.procedureListSheet({
      title: 'Reporte Solicitante',
      datasource: this.datasource().map((item) => ({
        ...item,
        group: 'Externo',
      })),
      columns: this.COLUMNS,
      filterParams: {
        params: {
          'Tipo de tramite': this.selectedTypeProcedure()?.name,
          'Busqueda por':
            this.typeSearch() === 'applicant' ? 'Solicitante' : 'Representante',
          'Tipo de solicitante': this.typeApplicant(),
          ...this.formApplicant().value,
        },
        labelsMap: this.LABELS_MAP,
      },
    });
  }

  searchTypesProcedure(term: string) {
    this.reportService.getTypeProcedures(term).subscribe((values) => {
      this.typeProcedures.set(
        values.map(({ label, value }) => ({
          label: label,
          value: { id: value, name: label },
        }))
      );
    });
  }

  selectTypeProcedure(option: typeProcedureOption | null) {
    this.selectedTypeProcedure.set(option);
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
      typeProcedures: this.typeProcedures(),
      selectedTypeProcedure: this.selectedTypeProcedure(),
      limit: this.limit(),
      index: this.offset(),
      hasSearched: this.hasSearched(),
    };
    this.cacheService.save(this.KEY_CACHE, cache);
  }

  private loadCache(): void {
    const cache = this.cacheService.load(this.KEY_CACHE);
    if (!cache) return;
    this.datasource.set(cache.datasource);
    this.datasize.set(cache.datasize);
    this.typeApplicant.set(cache.typeApplicant);
    this.typeSearch.set(cache.typeSearch);
    this.formApplicant().patchValue(cache.form);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
    this.typeProcedures.set(cache.typeProcedures);
    this.hasSearched.set(cache.hasSearched);
    this.selectedTypeProcedure.set(cache.selectedTypeProcedure);
  }
}
