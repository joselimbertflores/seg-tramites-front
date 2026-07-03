import { CommonModule } from '@angular/common';
import {
  inject,
  OnInit,
  signal,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { debounceTime, finalize, map } from 'rxjs';

import {
  CommonReportService,
  ProcedureReportService,
  ReportCacheService,
} from '../../services';
import { SelectSearchComponent } from '../../../../shared';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProcedureEfficiencyResponse } from '../../../infrastructure';

interface typeProcedureOption {
  value: string;
  label: string;
}

interface cache {
  form: object;
  results: ProcedureEfficiencyResponse[];
  typeProcedures: typeProcedureOption[];
  selectedTypes: typeProcedureOption[];
  hasSearched: boolean;
  expandedTypeId: string | null;
}
@Component({
  selector: 'app-report-efficiency',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    SelectSearchComponent,
    MatExpansionModule,
    RouterLink,
  ],
  templateUrl: './report-efficiency.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportEfficiencyComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private reportService = inject(ProcedureReportService);
  private commonReportService = inject(CommonReportService);
  private cacheService: ReportCacheService<cache> = inject(ReportCacheService);

  CURRENT_DATE = new Date();

  filterForm: FormGroup = inject(FormBuilder).group({
    segment: ['', Validators.required],
    institution: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: [this.CURRENT_DATE, Validators.required],
  });

  filterInputTypes = new FormControl('');
  typesProcedures = signal<typeProcedureOption[]>([]);
  selectedTypes = signal<typeProcedureOption[]>([]);
  institutions = toSignal(
    this.commonReportService
      .getInstitutions()
      .pipe(
        map((resp) =>
          resp.map((item) => ({ value: item._id, label: item.nombre })),
        ),
      ),
    { initialValue: [] },
  );

  segments = toSignal(
    this.commonReportService
      .getProcedureTypesSegments()
      .pipe(map((resp) => resp.map((item) => ({ value: item, label: item })))),
    { initialValue: [] },
  );
  isLoading = signal(false);
  hasSearched = signal(false);
  results = signal<ProcedureEfficiencyResponse[]>([]);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
  }

  expandedTypeId = signal<string | null>(null);

  toggleType(typeId: string) {
    this.expandedTypeId.update((current) =>
      current === typeId ? null : typeId,
    );
  }

  formatWorkingDays(days: number): string {
    return `${days} ${days === 1 ? 'día hábil' : 'días hábiles'}`;
  }

  ngOnInit(): void {
    this.loadCache();
    this.filterInputTypes.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (!value) return;
        this.searchProcedureTypes(value);
      });
  }

  generate() {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.reportService
      .getProceduresEfficiency(this.filterForm.value)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((data) => {
        this.results.set(data);
      });
  }

  selectSegment(value: string) {
    this.filterForm.patchValue({ segment: value });
  }

  selectInstitution(value: string) {
    this.filterForm.patchValue({ institution: value });
  }

  toggleRow(typeId: string) {
    this.expandedTypeId.update((current) =>
      current === typeId ? null : typeId,
    );
  }

  private searchProcedureTypes(term: string) {
    this.reportService.getTypeProcedures(term).subscribe((resp) => {
      this.typesProcedures.set(resp);
    });
  }

  private saveCache() {
    this.cacheService.saveCache('report-efficiency', {
      form: this.filterForm.value,
      results: this.results(),
      typeProcedures: this.typesProcedures(),
      selectedTypes: this.selectedTypes(),
      hasSearched: this.hasSearched(),
      expandedTypeId: this.expandedTypeId(),
    });
  }

  private loadCache() {
    const cache = this.cacheService.cache['report-efficiency'];
    if (!cache) return;
    this.filterForm.patchValue(cache.form);
    this.hasSearched.set(cache.hasSearched);
    this.results.set(cache.results);
    this.typesProcedures.set(cache.typeProcedures);
    this.selectedTypes.set(cache.selectedTypes);
    this.expandedTypeId.set(cache.expandedTypeId);
  }
}
