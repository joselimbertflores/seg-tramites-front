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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { procedureGroup } from '../../../../procedures/domain';
import { sendStatus } from '../../../../communications/domain';
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
  ],
  templateUrl: './report-dependents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export default class ReportDependentsComponent implements OnInit {
  private procedureReportService = inject(ProcedureReportService);
  private formBuilder = inject(FormBuilder);

  readonly procedureGroups = [
    { label: 'Tramites Externos', value: procedureGroup.External },
    { label: 'Tramites Internos', value: procedureGroup.Internal },
    { label: 'Tramites de Contrataciones', value: procedureGroup.Procurement },
  ];
  readonly participants = [
    { label: 'Correspondencia enviada', value: 'sender' },
    { label: 'Correspondencia recibida', value: 'recipient' },
  ];
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

  form: FormGroup = this.formBuilder.group({
    group: [null, Validators.required],
    participant: [''],
    startDate: ['', Validators.required],
    endDate: [this.currentDate, Validators.required],
  });

  ngOnInit(): void {}

  getData() {
    this.procedureReportService
      .getTotalCommunicationsByUnit(this.form.value)
      .subscribe((resp) => {
        this.dataSource.set(resp);
      });
  }

  generate() {
    this.getData();
  }

  print() {}
  clear() {}
}
