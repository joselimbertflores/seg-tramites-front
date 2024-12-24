import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { SelectionModel } from '@angular/cdk/collections';
import { OverlayModule } from '@angular/cdk/overlay';
import { filter, switchMap } from 'rxjs';

import {
  AlertService,
  CommunicationService,
} from '../../../../presentation/services';
import { SearchInputComponent } from '../../../../shared';
import {
  SubmissionDialogComponent,
  TransferDetails,
} from '../inbox/submission-dialog/submission-dialog.component';

import { StatusMail } from '../../../../domain/models';
import { communication } from '../../../infrastructure';

@Component({
  selector: 'outbox',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    OverlayModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './outbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OutboxComponent {
  private alertService = inject(AlertService);
  private communicationService = inject(CommunicationService);
  // private pdfService = inject(PdfService);

  private dialog = inject(MatDialog);

  datasource = signal<communication[]>([]);
  datasize = signal<number>(0);
  selection = new SelectionModel<communication>(true, []);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());

  term = signal<string>('');
  isOriginal = signal<boolean | null>(null);
  status = signal<StatusMail.Pending | StatusMail.Rejected | null>(null);

  readonly statusOptions = [
    { value: null, label: 'Todos' },
    { value: StatusMail.Rejected, label: 'Rechazados' },
    { value: StatusMail.Pending, label: 'Pendientes' },
  ];
  readonly documentOptions = [
    { value: null, label: 'Todos' },
    { value: true, label: 'Original' },
    { value: false, label: 'Copia' },
  ];
  readonly displayedColumns = [
    'select',
    'status',
    'code',
    'type',
    'reference',
    'recipient',
    'sentDate',
    'options',
  ];
  isOpen = false;

  constructor() {}

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.communicationService
      .getOutbox({
        limit: this.limit(),
        offset: this.offset(),
        term: this.term(),
        status: this.status(),
        isOriginal: this.isOriginal(),
      })
      .subscribe(({ communications, length }) => {
        this.datasource.set(communications);
        this.datasize.set(length);
        this.selection.clear();
      });
  }

  send({
    _id,
    status,
    procedure,
    isOriginal,
    attachmentsCount,
  }: communication): void {
    const data: TransferDetails = {
      attachmentsCount,
      isOriginal,
      procedure: { id: procedure._id, code: procedure.code },
      communication: {
        id: _id,
        status,
      },
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: communication[]) => {
      if (!result) return;
      this.datasource.update((values) => {
        values.unshift(...result);
        if (status === StatusMail.Rejected) {
          values = values.filter((el) => el._id !== _id);
        }
        if (values.length > this.limit()) {
          values.splice(this.limit(), values.length - this.limit());
        }
        return [...values];
      });
      this.datasize.update((value) => {
        value += result.length;
        if (status === StatusMail.Rejected) {
          value -= 1;
        }
        return value;
      });
      this.selection.clear();
    });
  }

  cacelSelection(): void {
    const communicationIds = this.selection.selected.map((el) => el._id);
    this._cancel(communicationIds);
  }

  cancelOne(communication: communication): void {
    this._cancel([communication._id], communication.procedure.code);
  }

  generateRouteMap({ procedure }: communication) {
    // TODO generate router map
    // forkJoin([
    //   this.procedureService.getDetail(procedure._id, procedure.group),
    //   this.procedureService.getWorkflow(procedure._id),
    // ]).subscribe((resp) => {
    //   this.pdfService.generateRouteSheet(resp[0], resp[1]);
    // });
  }

  search(term: string) {
    this.index.set(0);
    this.term.set(term);
    this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  filter() {
    this.index.set(0);
    this.isOpen = false;
    this.getData();
  }

  reset() {
    this.isOpen = false;
    this.status.set(null);
    this.isOriginal.set(null);
    this.term.set('');
    this.getData();
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.datasource().length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.datasource());
  }

  private _cancel(communicationIds: string[], code?: string): void {
    this.alertService
      .confirmDialog({
        title:
          communicationIds.length === 1
            ? `¿Cancelar tramite ${code}?`
            : `¿Cancelar los envios seleccionados?`,
        description: `Se cancelaran los envios que aun no hayan sido recibidos`,
      })
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.communicationService.cancel(communicationIds))
      )
      .subscribe(() => {
        this.datasource.update((values) =>
          values.filter(({ _id }) => !communicationIds.includes(_id))
        );
        this.datasize.update((value) => (value -= communicationIds.length));
        this.selection.clear();
        if (this.datasource().length === 0 && this.datasize() > 0) {
          this.index.set(0);
          this.getData();
        }
      });
  }
}
