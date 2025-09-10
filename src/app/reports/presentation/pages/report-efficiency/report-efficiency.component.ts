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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { debounceTime, finalize, map } from 'rxjs';

import {
  CommonReportService,
  ProcedureReportService,
  ReportCacheService,
} from '../../services';
import { procedureEfficiencyResponse } from '../../../infrastructure';
import { SelectSearchComponent } from '../../../../shared';

interface typeProcedureOption {
  value: string;
  label: string;
}

interface cache {
  form: object;
  results: procedureEfficiencyResponse[];
  typeProcedures: typeProcedureOption[];
  selectedTypes: typeProcedureOption[];
  hasSearched: boolean;
}
@Component({
  selector: 'app-report-efficiency',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    SelectSearchComponent,
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

  readonly announcer = inject(LiveAnnouncer);

  CURRENT_DATE = new Date();

  filterForm: FormGroup = inject(FormBuilder).group({
    types: ['', Validators.required],
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
          resp.map((item) => ({ value: item._id, label: item.nombre }))
        )
      ),
    { initialValue: [] }
  );
  isLoading = signal(false);
  hasSearched = signal(false);
  results = signal<procedureEfficiencyResponse[]>([]);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
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

  selectedType(event: MatAutocompleteSelectedEvent): void {
    const newType: typeProcedureOption = event.option.value;

    this.selectedTypes.update((values) => {
      if (values.find((item) => item.value === newType.value)) {
        return values;
      }
      return [...values, newType];
    });

    this.filterInputTypes.reset();

    event.option.deselect();

    this.filterForm.patchValue({ types: this.selectedTypes().map(({ value }) => value)});
  }

  removeType(option: typeProcedureOption): void {
    this.selectedTypes.update((values) => {
      this.announcer.announce(`Removed ${option.label}`);
      return values.filter((item) => item.value !== option.value);
    });
    this.filterForm.patchValue({ types: this.selectedTypes().map(({ value }) => value)});
  }

  selectInstitution(value: string) {
    this.filterForm.patchValue({ institution: value });
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
  }
}
