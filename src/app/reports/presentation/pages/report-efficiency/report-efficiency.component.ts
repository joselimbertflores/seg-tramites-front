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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { debounceTime, map } from 'rxjs';
import { CommonReportService, ProcedureReportService } from '../../services';
import { MatButtonModule } from '@angular/material/button';
import { SelectSearchComponent } from '../../../../shared';

interface typeProcedureOption {
  value: string;
  label: string;
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
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    SelectSearchComponent,
  ],
  templateUrl: './report-efficiency.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter(), MatSelectModule],
})
export default class ReportEfficiencyComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private reportService = inject(ProcedureReportService);
  private commonReportService = inject(CommonReportService);

  readonly announcer = inject(LiveAnnouncer);
  tiposSeleccionados = [
    'Aprobacion plqno de construccion ',
    'Aprobacion de tipo',
    'Aprobacion de ampliacion de lote',
  ];
  listaTipos = ['text'];
  resultados = [];

  displayedColumns = ['nombre', 'cantidad'];

  filterForm: FormGroup = inject(FormBuilder).group({
    types: ['', Validators.required],
    institution: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
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

  CURRENT_DATE = new Date();
  results = signal<any | null>(null);

  ngOnInit(): void {
    this.filterInputTypes.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (!value) return;
        this.searchProcedureTypes(value);
      });
  }

  generate() {
    this.reportService
      .getProceduresEfficiency(this.filterForm.value)
      .subscribe((data) => {
        console.log(data);
        // this.resultados = data;
        this.results.set(data);
      });
  }

  addType(event: MatAutocompleteSelectedEvent): void {
    const newType: typeProcedureOption = event.option.value;
    this.selectedTypes.update((values) => {
      if (values.find((item) => item.value === newType.value)) {
        return values;
      }
      return [...values, newType];
    });

    this.filterInputTypes.reset();
    event.option.deselect();
  }

  removeType(option: typeProcedureOption): void {
    this.selectedTypes.update((values) => {
      this.announcer.announce(`Removed ${option.label}`);
      return values.filter((item) => item.value !== option.value);
    });
  }

  selectInstitution(value: string) {
    this.filterForm.patchValue({ institution: value });
  }

  private searchProcedureTypes(term: string) {
    this.reportService.getTypeProcedures(term).subscribe((resp) => {
      this.typesProcedures.set(resp);
    });
  }
}
