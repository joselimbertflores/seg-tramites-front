import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { InternalDialogComponent } from './internal-dialog/internal-dialog.component';

import { transferDetails } from '../../../../infraestructure/interfaces';
import { MaterialModule } from '../../../../material.module';
import { PaginatorComponent } from '../../../../presentation/components';
import { PdfService, CacheService } from '../../../../presentation/services';
import { SearchInputComponent } from '../../../../shared';
import { InternalService, ProcedureService } from '../../services';
import { InternalProcedure } from '../../../domain/models/internal.model';
import {
  SubmissionDialogComponent,
  TransferDetails,
} from '../../../../communications/presentation/pages/inbox/submission-dialog/submission-dialog.component';

interface CacheData {
  results: InternalProcedure[];
  length: number;
  term: string;
}
@Component({
  selector: 'app-internals-manage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    PaginatorComponent,
    SearchInputComponent,
    SearchInputComponent,
  ],
  templateUrl: './internals-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InternalsManageComponent {
  private dialog = inject(MatDialog);
  private internalService = inject(InternalService);
  private procedureService = inject(ProcedureService);
  private pdfService = inject(PdfService);
  private cacheService: CacheService<CacheData> = inject(CacheService);

  displayedColumns: string[] = [
    'code',
    'reference',
    'applicant',
    'state',
    'startDate',
    'options',
  ];
  datasource = signal<InternalProcedure[]>([]);
  datasize = signal<number>(0);
  term: string = '';

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.savePaginationData();
    });
  }

  ngOnInit(): void {
    this.loadPaginationData();
  }

  getData(): void {
    this.internalService
      .findAll({ limit: this.limit, offset: this.offset })
      .subscribe((data) => {
        this.datasource.set(data.procedures);
        this.datasize.set(data.length);
      });
  }

  applyFilter(term: string) {
    this.term = term;
    this.cacheService.pageIndex.set(0);
    this.getData();
  }

  create() {
    const dialogRef = this.dialog.open(InternalDialogComponent, {
      maxWidth: '800px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((procedure) => {
      if (!procedure) return;
      this.datasize.update((value) => (value += 1));
      this.datasource.update((values) => {
        if (values.length === this.limit) values.pop();
        return [procedure, ...values];
      });
      this.send(procedure);
    });
  }

  update(procedure: InternalProcedure) {
    const dialogRef = this.dialog.open(InternalDialogComponent, {
      maxWidth: '800px',
      width: '800px',
      data: procedure,
    });
    dialogRef.afterClosed().subscribe((procedure) => {
      if (!procedure) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index] = procedure;
        return [...values];
      });
    });
  }

  send(procedure: InternalProcedure) {
    const data: TransferDetails = {
      procedureId: procedure._id,
      code: procedure.code,
      attachmentsCount: procedure.numberOfDocuments,
      isOriginal: true,
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '1200px',
      width: '1200px',
      data,
    });
    dialogRef.afterClosed().subscribe((message) => {
      if (!message) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index].isSend = true;
        return [...values];
      });
    });
  }

  generateRouteMap(procedure: InternalProcedure) {
    // this.procedureService.getWorkflow(procedure._id).subscribe((workflow) => {
    //   this.pdfService.generateRouteSheet(procedure, workflow);
    // });
  }

  private savePaginationData(): void {
    this.cacheService.resetPagination();
    const cache = {
      results: this.datasource(),
      length: this.datasize(),
      term: this.term,
    };
    this.cacheService.save('internals', cache);
  }

  private loadPaginationData(): void {
    const cacheData = this.cacheService.load('internals');
    if (!this.cacheService.keepAliveData() || !cacheData) {
      this.getData();
      return;
    }
    this.datasource.set(cacheData.results);
    this.datasize.set(cacheData.length);
    this.term = cacheData.term;
  }

  changePage(params: { limit: number; index: number }) {
    this.cacheService.pageSize.set(params.limit);
    this.cacheService.pageIndex.set(params.index);
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

  get PageParam(): { limit: number; index: number } {
    return { limit: this.limit, index: this.index };
  }
}
