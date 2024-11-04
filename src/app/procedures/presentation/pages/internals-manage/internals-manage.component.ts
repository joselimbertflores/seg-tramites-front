import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { CacheService, SearchInputComponent } from '../../../../shared';
import { InternalProcedure, StateProcedure } from '../../../domain';
import { InternalService } from '../../services';

import { InternalDialogComponent } from './internal-dialog/internal-dialog.component';
import {
  SubmissionDialogComponent,
  TransferDetails,
} from '../../../../communications/presentation/pages/inbox/submission-dialog/submission-dialog.component';

interface cache {
  datasource: InternalProcedure[];
  datasize: number;
  limit: number;
  index: number;
  term: string;
}
@Component({
  selector: 'app-internals-manage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './internals-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InternalsManageComponent {
  private dialog = inject(MatDialog);
  private internalService = inject(InternalService);
  // private pdfService = inject(PdfService);
  private cacheService: CacheService<cache> = inject(CacheService);

  displayedColumns: string[] = [
    'code',
    'reference',
    'applicant',
    'state',
    'createdAt',
    'options',
  ];
  datasource = signal<InternalProcedure[]>([]);
  datasize = signal<number>(0);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._saveCache();
    });
  }

  ngOnInit(): void {
    this._loadCache();
  }

  getData(): void {
    this.internalService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe((data) => {
        this.datasource.set(data.procedures);
        this.datasize.set(data.length);
      });
  }

  create() {
    const dialogRef = this.dialog.open(InternalDialogComponent, {
      maxWidth: '800px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((procedure) => {
      if (!procedure) return;
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [procedure, ...values];
      });
      this.datasize.update((value) => (value += 1));
      this.send(procedure);
    });
  }

  update(procedure: InternalProcedure) {
    const dialogRef = this.dialog.open(InternalDialogComponent, {
      maxWidth: '800px',
      width: '800px',
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

  send(procedure: InternalProcedure) {
    const data: TransferDetails = {
      procedureId: procedure._id,
      code: procedure.code,
      attachmentsCount: procedure.numberOfDocuments,
      isOriginal: true,
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
      data,
    });
    dialogRef.afterClosed().subscribe((message) => {
      if (!message) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index].state = StateProcedure.Revision;
        return [...values];
      });
    });
  }

  generateRouteMap(procedure: InternalProcedure) {
    // TODO gereate route map
    // this.procedureService.getWorkflow(procedure._id).subscribe((workflow) => {
    //   this.pdfService.generateRouteSheet(procedure, workflow);
    // });
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

  private _saveCache(): void {
    this.cacheService.save('internals', {
      datasource: this.datasource(),
      datasize: this.datasize(),
      term: this.term(),
      limit: this.limit(),
      index: this.index(),
    });
  }

  private _loadCache(): void {
    const cache = this.cacheService.load('internals');
    if (!cache) return this.getData();
    this.datasource.set(cache.datasource);
    this.datasize.set(cache.datasize);
    this.term.set(cache.term);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
  }
}
