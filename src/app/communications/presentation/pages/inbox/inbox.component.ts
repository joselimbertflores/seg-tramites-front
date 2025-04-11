import { CommonModule } from '@angular/common';
import {
  OnInit,
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { SelectionModel } from '@angular/cdk/collections';
import { OverlayModule } from '@angular/cdk/overlay';

import { filter, switchMap } from 'rxjs';

import {
  AlertService,
  CacheService,
  SearchInputComponent,
} from '../../../../shared';
import {
  submissionData,
  SubmissionDialogComponent,
} from './submission-dialog/submission-dialog.component';
import { communcationStatus, Communication } from '../../../domain';
import { procedureGroup } from '../../../../procedures/domain';
import { ArchiveDialogComponent } from './archive-dialog/archive-dialog.component';
import { SocketService } from '../../../../layout/presentation/services';
import { InboxService } from '../../services';

interface cache {
  datasource: Communication[];
  datasize: number;
  index: number;
  limit: number;
  form: Object;
  term: string;
  status: communcationStatus | 'all';
}

@Component({
  selector: 'app-inbox',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    SearchInputComponent,
  ],
  templateUrl: './inbox.component.html',
  styles: `
    .mail-pending {
      background-color: #fe5f55;
      color: white;

      a {
        color: white;
        font-weight: bold;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InboxComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private formBuilder = inject(FormBuilder);

  private inboxService = inject(InboxService);
  private socketService = inject(SocketService);
  private alertService = inject(AlertService);
  private cacheService: CacheService<cache> = inject(CacheService);
  // private pdfService = inject(PdfService);

  datasource = signal<Communication[]>([]);
  datasize = signal<number>(0);
  selection = new SelectionModel<Communication>(true, []);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');
  isOpen = false;

  filterForm: FormGroup = this.formBuilder.group({
    group: [],
    isOriginal: [],
  });

  status = signal<communcationStatus | 'all'>('all');

  isLoading = signal(true);

  readonly displayedColumns: string[] = [
    'select',
    'group',
    'code',
    'reference',
    'emitter',
    'sentDate',
    'options',
  ];

  readonly groups = [
    { value: procedureGroup.External, label: 'Externos' },
    { value: procedureGroup.Internal, label: 'Internos' },
    { value: 'ProcurementProcedure', label: 'Contrataciones' },
  ];

  readonly documentTypes = [
    { value: true, label: 'Original' },
    { value: false, label: 'Copia' },
  ];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
    this.listenNewCommunications();
    this.listenCancelCommunications();
  }

  ngOnInit(): void {
    this.loadCache();
  }

  getData(): void {
    this.inboxService
      .getInbox({
        limit: this.limit(),
        offset: this.offset(),
        term: this.term(),
        ...this.filterForm.value,
        ...(this.status() !== 'all' && { status: this.status() }),
      })
      .subscribe(({ communications, length }) => {
        this.datasource.set(communications);
        this.datasize.set(length);
        this.selection.clear();
        this.isLoading.set(false);
      });
  }

  send(item: Communication) {
    const data: submissionData = {
      mode: 'forward',
      communicationId: item.id,
      procedure: { id: item.procedure.ref, code: item.procedure.code },
      attachmentsCount: item.attachmentsCount,
      isOriginal: item.isOriginal,
    };
    const dialogRef = this.dialogRef.open(SubmissionDialogComponent, {
      maxWidth: '1100px',
      width: '1100px',
      data,
    });
    dialogRef.afterClosed().subscribe((message: string) => {
      if (!message) return;
      this.removeItems([item.id]);
    });
  }

  accept(items: Communication[]): void {
    this.alertService
      .confirmDialog({
        title:
          items.length === 1
            ? `¿Aceptar tramite ${items[0].procedure.code}?`
            : `¿Aceptar los tramites seleccionados?`,
        description:
          'IMPORTANTE: Solo debe aceptar tramites que haya recibido en fisico',
      })
      .pipe(
        filter((result) => result),
        switchMap(() => this.inboxService.accept(items.map(({ id }) => id)))
      )
      .subscribe({
        next: (ids) => this.setStatusItems(ids, communcationStatus.Received),
        error: (error) => this.hadleHttpErrors(error),
      });
  }

  reject(items: Communication[]): void {
    const selection = items.map(({ id }) => id);
    this.alertService
      .descriptionDialog({
        title:
          items.length === 1
            ? `¿Rechazar tramite ${items[0].procedure.code}?`
            : `¿Rechazar los tramites seleccionados?`,
        placeholder: 'Ingrese una descripcion clara ',
      })
      .pipe(
        filter((description) => !!description),
        switchMap((description) =>
          this.inboxService.reject(selection, description!)
        )
      )
      .subscribe({
        next: (ids) => this.removeItems(ids),
        error: (error) => this.hadleHttpErrors(error),
      });
  }

  archive(items: Communication[]) {
    const dialogRef = this.dialogRef.open(ArchiveDialogComponent, {
      width: '600px',
      data: items,
    });
    dialogRef.afterClosed().subscribe((result: string[]) => {
      if (!result) return;
      this.removeItems(result);
    });
  }

  search(term: string) {
    this.index.set(0);
    this.term.set(term);
    this.getData();
  }

  filterByForm() {
    this.index.set(0);
    this.isOpen = false;
    this.getData();
  }

  filterByStatus() {
    this.index.set(0);
    this.getData();
  }

  reset() {
    this.filterForm.reset();
    this.isOpen = false;
    this.getData();
  }

  generateRouteMap({ procedure }: Communication) {
    // forkJoin([
    //   this.procedureService.getDetail(procedure._id, procedure.group),
    //   this.procedureService.getWorkflow(procedure._id),
    // ]).subscribe((resp) => {
    //   this.pdfService.generateRouteSheet(resp[0], resp[1]);
    // });
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

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  isButtonEnabledForStatus(status: string): boolean {
    return (
      this.selection.selected.every((el) => el.status === status) &&
      this.selection.selected.length > 0
    );
  }

  private listenNewCommunications(): void {
    this.socketService
      .listenNewCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((item) => {
        this.datasource.update((values) =>
          [item, ...values].slice(0, this.limit())
        );
        this.datasize.update((length) => (length += 1));
      });
  }

  private listenCancelCommunications() {
    this.socketService
      .listenCancelCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this.removeItems([id]);
      });
  }

  private removeItems(ids: string[]): void {
    this.datasource.update((items) =>
      items.filter(({ id }) => !ids.includes(id))
    );
    this.datasize.update((length) => (length -= ids.length));
    this.selection.clear();
    if (this.datasource().length === 0 && this.datasize() > 0) {
      this.getData();
    }
  }

  private setStatusItems(ids: string[], status: communcationStatus) {
    this.datasource.update((values) =>
      values.map((item) => {
        if (ids.includes(item.id)) {
          item.status = status;
        }
        return item;
      })
    );
  }

  private hadleHttpErrors(error: any) {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      const { toRemove = [], message = '' } = error.error;
      this.removeItems(toRemove);
    }
  }

  private saveCache(): void {
    this.cacheService.save('inbox', {
      datasource: this.datasource(),
      datasize: this.datasize(),
      limit: this.limit(),
      index: this.index(),
      form: this.filterForm.value,
      term: this.term(),
      status: this.status(),
    });
  }

  private loadCache(): void {
    const cache = this.cacheService.load('inbox');
    if (!cache || !this.cacheService.keepAlive()) return this.getData();
    this.term.set(cache.term);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
    this.status.set(cache.status);
    this.datasize.set(cache.datasize);
    this.datasource.set(cache.datasource);
    this.filterForm.patchValue(cache.form);
  }
}
