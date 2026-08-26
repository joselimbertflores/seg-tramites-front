import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ProcedureReportService, ReportCacheService } from '../../services';
import { procedureGroup, procedureState } from '../../../../procedures/domain';
import { RouterLink } from '@angular/router';
import { PdfService } from '../../../../shared';
import { provideNativeDateAdapter } from '@angular/material/core';


interface cache {
  datasource: any[];
  datasize: number;
  isAdvancedMode: boolean;
  hasSearched: boolean;
  form: object;
  limit: number;
  index: number;
}


@Component({
  selector: 'app-report-location',
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
    RouterLink
  ],
  templateUrl: './report-location.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
   providers: [provideNativeDateAdapter()],
})
export default class ReportLocation {
   private formBuilder = inject(FormBuilder);
  isAdvancedMode = signal<boolean>(false);
  filterForm = computed<FormGroup>(() =>
    this.isAdvancedMode() ? this.createAdvancedForm() : this.createSimpleForm()
  );
    private cacheService: ReportCacheService<cache> = inject(ReportCacheService);
  private destroyRef = inject(DestroyRef);
  private pdfService = inject(PdfService);
    
  datasource = signal<any[]>([]);
  datasize = signal<number>(0);
  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  isLoading = signal(false);
  hasSearched = signal(false);
   readonly CURRENT_DATE = new Date();
private reportService = inject(ProcedureReportService);
readonly GROUPS = [
    { label: 'Externos', value: procedureGroup.External },
    { label: 'Internos', value: procedureGroup.Internal },
    { label: 'Contrataciones', value: procedureGroup.Procurement },
  ] as const;
 readonly STATES = Object.values(procedureState).map((value) => value);


  readonly LABELS_MAP:Record<string, string> = {
    reference: 'Referencia',
    start: 'Fecha inicio',
    end: 'Fecha fin',
    state: 'Estado',
    group: 'Grupo',
    code: 'Codigo',
    type: 'Tipo',
    cite: 'Cite',
  } as const;


  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
  }

   ngOnInit(): void {
    this.loadCache();
  }


  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
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


   selectSearchMode(isAdvancedMode: boolean) {
    this.isAdvancedMode.set(isAdvancedMode);
  }

  getData() {
    if (this.filterForm().invalid) return;
    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.reportService
      .searchProcedureLocation(
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

    clear() {
    this.filterForm().reset({});
  }

    get isFormValid() {
    return (
      this.filterForm().valid &&
      Object.values(this.filterForm().value).filter((value) => value).length >=
        2
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

  print() {
     this.pdfService
      .locationSheet({
        title: 'Reporte ubicación de trámites',
        procedures: this.datasource(),
        parameters: Object.entries(this.filterForm().value)
      .filter((property) => property[1])
      .reduce((acc, [key, value]) => {
        const label = this.LABELS_MAP[key] ?? key;
        const translated = this.LABELS_MAP[key]?.[value as any] ?? value;
        return { ...acc, [label]: label === 'Grupo' ? this.translateProcedureGroup(value as string) : translated};
      }, {})
      })
      .subscribe((pdf) => {
        pdf.open();
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

   generate() {
    this.index.set(0);
    this.getData();
  }

}
