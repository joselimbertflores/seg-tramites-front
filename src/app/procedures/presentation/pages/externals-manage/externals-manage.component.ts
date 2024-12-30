import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

import { ExternalDialogComponent } from './external-dialog/external-dialog.component';

import { CacheService, SearchInputComponent } from '../../../../shared';
import { ExternalProcedure, StateProcedure } from '../../../domain';
import { ExternalService } from '../../services';
import { SubmissionDialogComponent } from '../../../../communications/presentation/pages/inbox/submission-dialog/submission-dialog.component';
import { submissionDialogData } from '../../../../communications/domain';

interface cache {
  datasource: ExternalProcedure[];
  datasize: number;
  term: string;
  limit: number;
  index: number;
}
@Component({
  selector: 'app-externals-manage',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  templateUrl: './externals-manage.component.html',
})
export default class ExternalsManageComponent {
  private dialog = inject(MatDialog);
  private externalService = inject(ExternalService);
  private cacheService: CacheService<cache> = inject(CacheService);
  // private pdfService = inject(PdfService);

  datasource = signal<ExternalProcedure[]>([]);
  datasize = signal<number>(0);
  displayedColumns: string[] = [
    'send',
    'code',
    'reference',
    'applicant',
    'createdAt',
    'options',
  ];

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
    this.externalService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ procedures, length }) => {
        this.datasource.set(procedures);
        this.datasize.set(length);
      });
  }

  create(): void {
    const dialogRef = this.dialog.open(ExternalDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
    });
    dialogRef.afterClosed().subscribe((result: ExternalProcedure) => {
      if (!result) return;
      this.datasize.update((value) => (value += 1));
      this.datasource.update((values) => {
        if (values.length === this.limit()) values.pop();
        return [result, ...values];
      });
      this.send(result);
    });
  }

  update(procedure: ExternalProcedure): void {
    const dialogRef = this.dialog.open(ExternalDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
      data: procedure,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => {
        const indexFound = values.findIndex(({ _id }) => _id === result._id);
        values[indexFound] = result;
        return [...values];
      });
    });
  }

  send(procedure: ExternalProcedure): void {
    const transfer: submissionDialogData = {
      procedure: { id: procedure._id, code: procedure.code },
      attachmentsCount: procedure.numberOfDocuments,
      isOriginal: true,
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
      data: transfer,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex(({ _id }) => _id === procedure._id);
        values[index].state = StateProcedure.Revision;
        return [...values];
      });
    });
  }

  generateRouteMap(procedure: ExternalProcedure) {
    // TODO generate route map
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
    this.cacheService.save('externals', {
      datasource: this.datasource(),
      datasize: this.datasize(),
      term: this.term(),
      limit: this.limit(),
      index: this.index(),
    });
  }

  private _loadCache(): void {
    const cache = this.cacheService.load('externals');
    if (!cache) return this.getData();
    this.datasource.set(cache.datasource);
    this.datasize.set(cache.datasize);
    this.term.set(cache.term);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
  }
}
