import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTooltipModule } from '@angular/material/tooltip';

import { filter, forkJoin, switchMap } from 'rxjs';
import { GroupedCommunication, StatusMail } from '../../../../domain/models';
import {
  PaginatorComponent,
  SidenavButtonComponent,
} from '../../../../presentation/components';
import { StateLabelPipe } from '../../../../presentation/pipes';
import {
  AlertService,
  ProcedureService,
  PdfService,
  CacheService,
} from '../../../../presentation/services';
import { SearchInputComponent } from '../../../../shared';
import { communication } from '../../../infrastructure';
import { OutboxService } from '../../services';
import {
  SubmissionDialogComponent,
  TransferDetails,
} from '../inbox/submission-dialog/submission-dialog.component';

interface PaginationOptions {
  limit: number;
  index: number;
}
interface CacheData {
  results: GroupedCommunication[];
  length: number;
  term: string;
}
@Component({
  selector: 'outbox',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    PaginatorComponent,
    SearchInputComponent,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  templateUrl: './outbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OutboxComponent {
  private alertService = inject(AlertService);
  private outboxService = inject(OutboxService);
  private procedureService = inject(ProcedureService);
  private pdfService = inject(PdfService);
  private cacheService: CacheService<CacheData> = inject(CacheService);

  private dialog = inject(MatDialog);

  public displayedColumns = [
    'select',
    'status',
    'code',
    'type',
    'reference',
    'recipient',
    'sentDate',
    'options',
  ];
  public datasource = signal<communication[]>([]);
  public datasize = signal<number>(0);
  public expandedElement: GroupedCommunication | null = null;
  public term: string = '';

  selection = new SelectionModel<communication>(true, []);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.savePaginationData();
    });
  }

  ngOnInit(): void {
    // this.loadPaginationData();
    this.getData();
  }

  getData() {
    this.outboxService.findAll(this.limit, this.offset).subscribe((data) => {
      this.datasource.set(data.mails);
      this.datasize.set(data.length);
    });
  }

  applyFilter(term: string) {
    this.term = term;
    this.cacheService.pageIndex.set(0);
    this.getData();
  }

  cancel(): void {
    const selectedCommunications = this.selection.selected.map(
      ({ _id, procedure }) => ({
        communicationId: _id,
        procedureId: procedure._id,
      })
    );
    this.alertService
      .confirmDialog({
        title: `¿Esta seguro en cancelar ${selectedCommunications.length} envios?`,
        description: 'Se cancelaran los envios que aun no hayan sido recibidos',
      })
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.outboxService.cancel(selectedCommunications))
      )
      .subscribe(() => {
        selectedCommunications.forEach(({ communicationId }) =>
          this._removeDatasourceItem(communicationId)
        );
      });
  }

  cancelAll(communication: GroupedCommunication) {
    // const ids = communication.dispatches.map((item) => item._id);
    // this.alertService.QuestionAlert({
    //   title: `¿Cancelar remision del tramite ${communication.procedure.code}?`,
    //   text: `Envios a cancelar: ${ids.length}`,
    //   callback: () => {
    //     this.cancelMails(communication.procedure._id, ids, communication.date);
    //   },
    // });
  }

  cancelSelection(): void {
    // this.alertService.QuestionAlert({
    //   title: `¿Cancelar remision del tramtie ${communication.procedure.code}?`,
    //   text: `Envios a cancelar: ${ids.length}`,
    //   callback: () => {
    //     this.cancelMails(communication.procedure._id, ids, communication.date);
    //   },
    // });
  }

  generateRouteMap({ procedure }: GroupedCommunication) {
    forkJoin([
      this.procedureService.getDetail(procedure._id, procedure.group),
      this.procedureService.getWorkflow(procedure._id),
    ]).subscribe((resp) => {
      this.pdfService.generateRouteSheet(resp[0], resp[1]);
    });
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

  changePage({ limit, index }: PaginationOptions) {
    this.cacheService.pageSize.set(limit);
    this.cacheService.pageIndex.set(index);
    this.getData();
  }

  get index() {
    return this.cacheService.pageIndex();
  }
  get limit() {
    return this.cacheService.pageSize();
  }
  get offset() {
    return this.cacheService.pageOffset();
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
    dialogRef.afterClosed().subscribe((message: string) => {
      if (!message) return;
    });
  }

  private _removeDatasourceItem(id: string): void {
    this.datasource.update((values) => values.filter((el) => el._id !== id));
    this.datasize.update((length) => (length -= 1));
  }
}
