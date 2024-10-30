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

import { OverlayModule } from '@angular/cdk/overlay';
import { SelectionModel } from '@angular/cdk/collections';
import { filter, switchMap } from 'rxjs';

import {
  AlertService,
  ProcedureService,
  PdfService,
  CacheService,
  CommunicationService,
} from '../../../../presentation/services';
import { SearchInputComponent } from '../../../../shared';
import {
  SubmissionDialogComponent,
  TransferDetails,
} from '../inbox/submission-dialog/submission-dialog.component';

import { StatusMail } from '../../../../domain/models';
import { communication } from '../../../infrastructure';

interface CacheData {
  results: communication[];
  length: number;
  term: string;
}
@Component({
  selector: 'outbox',
  standalone: true,
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
    MatToolbarModule,
    MatSelectModule,
    MatCheckboxModule,
    SearchInputComponent,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './outbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OutboxComponent {
  private alertService = inject(AlertService);
  private communicationService = inject(CommunicationService);
  private procedureService = inject(ProcedureService);
  private pdfService = inject(PdfService);
  private cacheService: CacheService<CacheData> = inject(CacheService);

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
    procedure,
    attachmentsCount,
    isOriginal,
    status,
  }: communication): void {
    const detail: TransferDetails = {
      attachmentsCount,
      isOriginal,
      procedureId: procedure._id,
      code: procedure.code,
      communication: {
        id: _id,
        status,
      },
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      data: detail,
    });
    dialogRef.afterClosed().subscribe((result: communication[]) => {
      if (!result) return;
      switch (status) {
        case StatusMail.Pending:
          this.datasource.update((values) => [...result, ...values]);
          this.datasize.update((value) => (value += result.length));
          break;
        case StatusMail.Rejected:
          this.datasource.update((values) => {
            const filtered = values.filter((el) => el._id !== _id);
            return [...result, ...filtered];
          });
          this.datasize.update((value) => (value += result.length - 1));
          break;
        default:
          break;
      }
    });
  }

  cancelSelectedCommunications(): void {
    const selection = this.selection.selected.map((el) => el._id);
    this.alertService
      .confirmDialog({
        title: `¿Cancelar los envios seleccionados?`,
        description: 'Se cancelaran los envios que aun no hayan sido recibidos',
      })
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.communicationService.cancel(selection))
      )
      .subscribe(() => {
        this.datasource.update((values) =>
          values.filter(({ _id }) => !selection.includes(_id))
        );
        this.datasize.update((value) => (value -= selection.length));
        this.selection.clear();
      });
  }

  cancel(communication: communication): void {
    this.alertService
      .confirmDialog({
        title: `¿Cancelar tramite ${communication.procedure.code}?`,
        description: `Se cancelaran los envios que aun no hayan sido recibidos`,
      })
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.communicationService.cancel([communication._id]))
      )
      .subscribe(() => {
        this.datasource.update((values) =>
          values.filter(({ _id }) => _id !== communication._id)
        );
        this.datasize.update((value) => (value -= 1));
        this.selection.clear();
      });
  }

  generateRouteMap({ procedure }: communication) {
    // forkJoin([
    //   this.procedureService.getDetail(procedure._id, procedure.group),
    //   this.procedureService.getWorkflow(procedure._id),
    // ]).subscribe((resp) => {
    //   this.pdfService.generateRouteSheet(resp[0], resp[1]);
    // });
  }

  private removeElementDatasource(outboundDate: Date, ids: string[]) {
    // this.datasource.update((values) => {
    //   const index = values.findIndex((item) => item.date === outboundDate);
    //   const filteredDispatches = values[index].dispatches.filter(
    //     (mail) => !ids.includes(mail._id)
    //   );
    //   values[index].dispatches = filteredDispatches;
    //   if (filteredDispatches.length === 0) {
    //     this.datasize.update((length) => (length -= 1));
    //     values.splice(index, 1);
    //   }
    //   return [...values];
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

  private savePaginationData(): void {
    // this.cacheService.resetPagination();
    // const cache: CacheData = {
    //   results: this.datasource(),
    //   length: this.datasize(),
    //   term: this.term,
    // };
    // this.cacheService.save('outbox', cache);
  }

  private loadPaginationData(): void {
    // const cacheData = this.cacheService.load('outbox');
    // if (!this.cacheService.keepAliveData() || !cacheData) {
    //   this.getData();
    //   return;
    // }
    // this.datasource.set(cacheData.results);
    // this.datasize.set(cacheData.length);
    // this.term = cacheData.term;
  }
}
