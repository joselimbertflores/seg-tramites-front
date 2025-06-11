import { CommonModule } from '@angular/common';
import {
  OnInit,
  inject,
  signal,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { provideNativeDateAdapter } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';

import { procedureGroup } from '../../../../procedures/domain';
import { sendStatus } from '../../../../communications/domain';
import { AlertMessageComponent, PdfService } from '../../../../shared';
import { ProcedureReportService } from '../../services';

@Component({
  selector: 'app-report-dependents',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressBarModule,
    AlertMessageComponent,
  ],
  templateUrl: './report-dependents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportDependentsComponent implements OnInit {
  private procedureReportService = inject(ProcedureReportService);
  private pdfService = inject(PdfService);
  private formBuilder = inject(FormBuilder);

  readonly PARTICIPANT_MAP: Record<string, string> = {
    sender: 'Correspondencia enviada',
    recipient: 'Correspondencia recibida',
  };

  readonly PROCEDURE_GROUP_MAP = {
    [procedureGroup.External]: 'Tramites Externos',
    [procedureGroup.Internal]: 'Tramites Internos',
    [procedureGroup.Procurement]: 'Tramites de Contrataciones',
  };

  readonly columnsToDisplay = [
    { columnDef: sendStatus.Archived, header: 'Archivados' },
    { columnDef: sendStatus.AutoRejected, header: 'Expirados' },
    { columnDef: sendStatus.Completed, header: 'Enviados' },
    { columnDef: sendStatus.Forwarding, header: 'Reenviados' },
    { columnDef: sendStatus.Pending, header: 'Sin aceptar' },
    { columnDef: sendStatus.Received, header: 'Recibidos' },
    { columnDef: sendStatus.Rejected, header: 'Rechazados' },
  ];
  readonly currentDate = new Date();

  displayedColumns: string[] = [
    'officer',
    ...this.columnsToDisplay.map((item) => item.columnDef),
    'total',
  ];
  dataSource = signal<object[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);

  form: FormGroup = this.formBuilder.group({
    group: [null],
    participant: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: [this.currentDate, Validators.required],
  });

  readonly LABELS_MAP = {
    group: 'Grupo',
    startDate: 'Fecha inicio',
    endDate: 'Fecha fin',
    participant: 'Tipo correspondencia',
  } as const;

  ngOnInit(): void {}

  getData() {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.procedureReportService
      .getTotalCommunicationsByUnit(this.form.value)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe((resp) => {
        this.dataSource.set(resp);
      });
  }

  generate() {
    this.getData();
  }

  print() {
    this.pdfService.tableReportShet({
      title: 'Reporte "Dependientes"',
      datasource: this.dataSource(),
      columns: [
        { columnDef: 'officer', header: 'Funcionario', width: '*' },
        { columnDef: 'jobTitle', header: 'Cargo', width: '*' },
        ...this.columnsToDisplay,
        { columnDef: 'total', header: 'Total' },
      ],
      filterParams: {
        params: this.form.value,
        labelsMap: this.LABELS_MAP,
        valuesMap: {
          participant: this.PARTICIPANT_MAP,
          group: this.PROCEDURE_GROUP_MAP,
        },
      },
    });
  }

  clear() {
    this.form.reset();
  }

  get participants() {
    return Object.entries(this.PARTICIPANT_MAP).map(([value, label]) => ({
      value,
      label,
    }));
  }

  get procedureGroups() {
    return Object.entries(this.PROCEDURE_GROUP_MAP).map(([value, label]) => ({
      value,
      label,
    }));
  }
}
