import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map, switchMap } from 'rxjs';

import {
  SelectSearchOption,
  SelectSearchComponent,
  PdfService,
} from '../../../../shared';
import {
  CommonReportService,
  CommunicationReportService,
} from '../../services';
import { CorrespondenceStatusByUnitResponse } from '../../../infrastructure';
import { sendStatus } from '../../../../communications/domain';

type FilterByProp = 'recipient' | 'sender';
@Component({
  selector: 'report-unit-correspondence-status',
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatInputModule,
    SelectSearchComponent,
    MatSelectModule,
    MatProgressBarModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './report-unit-correspondence-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportUnitCorrespondenceStatusComponent implements OnInit {
  private commonService = inject(CommonReportService);
  private reportService = inject(CommunicationReportService);
  private pdfService = inject(PdfService);

  private formBuilder = inject(FormBuilder);
  form: FormGroup = this.formBuilder.nonNullable.group({
    dependencyId: [null, Validators.required],
    filterBy: ['recipient', Validators.required],
  });

  institutions = toSignal(this.getInstitutions(), { initialValue: [] });
  dependencies = signal<SelectSearchOption<string>[]>([]);
  selectedDependency = signal<string | null>(null);
  selectedInstitution = signal<string | null>(null);

  readonly FILTER_OPTIONS = [
    { value: 'recipient', label: 'Bandeja de entrada' },
    { value: 'sender', label: 'Bandeja de salida' },
  ];

  isLoading = signal(false);
  dataSource = new MatTableDataSource();
  filterBy = signal<FilterByProp>('recipient');

  readonly columnsToDisplay = computed(() =>
    this.filterBy() === 'recipient'
      ? [
          { columnDef: sendStatus.Pending, header: 'Sin recibir' },
          { columnDef: sendStatus.Received, header: 'Recibidos' },
        ]
      : [
          { columnDef: sendStatus.Pending, header: 'Sin recibir' },
          { columnDef: sendStatus.AutoRejected, header: 'Auto rechazados' },
        ]
  );

  readonly displayedColumns = computed(() => [
    'officer',
    ...this.columnsToDisplay().map((item) => item.columnDef),
    'total',
    'options',
  ]);

  hasSearched = signal(false);
  isDetailLoading = signal(false);

  ngOnInit(): void {
    this.generate();
  }

  generate() {
    const { dependencyId, filterBy } = this.form.value;
    this.isLoading.set(true);
    this.reportService
      .getCorrespondenceStatusByUnit(filterBy, dependencyId)
      .subscribe((result) => {
        this.isLoading.set(false);
        this.hasSearched.set(true);
        this.dataSource.data = result;
      });
  }

  setFilterByProperty(value: FilterByProp) {
    this.filterBy.set(value);
    this.dataSource.data = [];
    this.generate();
  }

  selectInstitution(value: string): void {
    this.commonService.getDependencies(value).subscribe((resp) => {
      this.dependencies.set(
        resp.map((item) => ({ value: item._id, label: item.nombre }))
      );
    });
  }

  onSelectDependency(value: string): void {
    this.form.patchValue({ dependencyId: value });
    this.generate();
  }

  getStatusCount(item: { status: string; count: number }[], status: string) {
    return item.find((el) => el.status === status)?.count ?? 0;
  }

  viewAccountDetail(item: CorrespondenceStatusByUnitResponse) {
    this.isDetailLoading.set(true);
    this.reportService
      .getCorrespondenceByAccount(item.id, this.filterBy())
      .pipe(
        switchMap((data) => {
          return this.pdfService.tableSheet({
            title: `Reporte "Estado de Correspondencia" - ${
              this.filterBy() === 'recipient'
                ? 'Bandeja de entrada'
                : 'Bandeja de salida'
            }`,
            dataSource: data,
            displayColumns: [
              { columnDef: 'code', header: 'Alterno' },
              { columnDef: 'reference', header: 'Refenrecia', width: '*' },
              { columnDef: 'sentDate', header: 'Fecha envio' },
              {
                columnDef: 'fullName',
                header:
                  this.filterBy() === 'recipient' ? 'Emisor' : 'Destinatario',
              },
              { columnDef: 'status', header: 'Status' },
            ],
            filterParams: {
              params: {
                Funcionario: `${item.fullName ?? 'SIN ASIGNAR'}  --  ${
                  item.jobTitle
                }`,
              },
            },
          });
        }),
        finalize(() => this.isDetailLoading.set(false))
      )
      .subscribe((pdf) => {
        pdf.open();
      });
  }

  private getInstitutions() {
    return this.commonService
      .getInstitutions()
      .pipe(
        map((resp) =>
          resp.map((item) => ({ value: item._id, label: item.nombre }))
        )
      );
  }
}
