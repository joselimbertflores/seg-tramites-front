import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SearchInputComponent } from '../../../../shared';
import { ProcurementService } from '../../services';
import { InternalProcedure, procedureState } from '../../../domain';
import { InternalDialogComponent } from '../internals-manage/internal-dialog/internal-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { ProcurementDialogComponent } from './procurement-dialog/procurement-dialog.component';
import { submissionDialogData } from '../../../../communications/domain';
import { SubmissionDialogComponent } from '../../../../communications/presentation/pages/inbox/submission-dialog/submission-dialog.component';

@Component({
  selector: 'app-procurements-manage',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatMenuModule,
    SearchInputComponent,
  ],
  templateUrl: './procurements-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProcurementsManageComponent implements OnInit {
  private procurementService = inject(ProcurementService);

  datasource = signal<InternalProcedure[]>([]);
  datasize = signal<number>(0);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'code',
    'reference',
    'type',
    'createdAt',
    'options',
  ];

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.procurementService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe((data) => {
        this.datasource.set(data.procedures);
        this.datasize.set(data.length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(ProcurementDialogComponent, {
      maxWidth: '1200px',
      width: '1200px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((procedure) => {
      if (!procedure) return;
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [procedure, ...values];
      });
      this.datasize.update((value) => (value += 1));
      // this.send(procedure);
    });
  }

  update(procedure: InternalProcedure) {
    const dialogRef = this.dialog.open(ProcurementDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      data: procedure,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index] = result;
        return [...values];
      });
    });
  }

  send(procedure: any) {
    const data: submissionDialogData = {
      procedure: {
        id: procedure._id,
        code: procedure.code,
      },
      attachmentsCount: procedure.numberOfDocuments,
      cite: procedure.cite,
      isOriginal: true,
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '1100px',
      width: '1100px',
      data,
    });
    dialogRef.afterClosed().subscribe((message) => {
      if (!message) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index].state = procedureState.Revision;
        return [...values];
      });
    });
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }
}
