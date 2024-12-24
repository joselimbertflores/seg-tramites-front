import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
  StatusMail,
  Communication,
  StateProcedure,
} from '../../../../domain/models';
import {
  PdfService,
  AlertService,
  SocketService,
  ArchiveService,
  CommunicationService,
} from '../../../../presentation/services';
import { CacheService, SearchInputComponent } from '../../../../shared';
import { communication } from '../../../infrastructure';
import {
  TransferDetails,
  SubmissionDialogComponent,
} from './submission-dialog/submission-dialog.component';

interface cache {
  datasource: communication[];
  datasize: number;
  index: number;
  limit: number;
  form: Object;
}
@Component({
  selector: 'app-inbox',
  imports: [
    CommonModule,
    RouterModule,
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
  private inboxService = inject(CommunicationService);
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private dialog = inject(MatDialog);
  private pdfService = inject(PdfService);
  private archiveService = inject(ArchiveService);
  private cacheService: CacheService<cache> = inject(CacheService);
  private formBuilder = inject(FormBuilder);

  datasource = signal<communication[]>([]);
  datasize = signal<number>(0);
  selection = new SelectionModel<communication>(true, []);

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  isOpen = false;

  filterForm = this.formBuilder.nonNullable.group({
    status: [''],
    from: [''],
    group: [''],
    term: [''],
  });

  readonly displayedColumns: string[] = [
    'select',
    'group',
    'code',
    'reference',
    'emitter',
    'sentDate',
    'options',
  ];
  readonly statusOptions = [
    { value: null, label: 'Todos' },
    { value: StatusMail.Pending, label: 'Sin Recibir' },
    { value: StatusMail.Received, label: 'Recibidos' },
  ];
  readonly groups = [
    { value: null, label: 'Todos' },
    { value: 'ExternalProcedure', label: 'Externos' },
    { value: 'InternalProcedure', label: 'Internos' },
    { value: 'Contratacion', label: 'Contrataciones' },
  ];

  constructor() {
    this._listenCommunications();
    this._listenCancelDispatches();
    this.destroyRef.onDestroy(() => {
      this._saveCache();
    });
  }
  ngOnInit(): void {
    this._loadCache();
  }

  getData(): void {
    this.inboxService
      .getInbox({
        limit: this.limit(),
        offset: this.offset(),
        filterForm: this.filterForm.value,
      })
      .subscribe(({ communications, length }) => {
        this.datasource.set(communications);
        this.datasize.set(length);
        this.selection.clear();
      });
  }

  acceptMultiple(): void {
    this._accept(this.selection.selected);
  }

  acceptOne(item: communication): void {
    this._accept([item]);
  }

  rejectOne(item: communication): void {
    this._reject([item]);
  }

  rejectMultiple(): void {
    this._reject(this.selection.selected);
  }

  send({
    _id,
    status,
    procedure,
    isOriginal,
    attachmentsCount,
  }: communication) {
    const data: TransferDetails = {
      attachmentsCount,
      isOriginal,
      communication: { id: _id, status: status },
      procedure: { id: procedure._id, code: procedure.code },
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      data,
    });
    dialogRef.afterClosed().subscribe((message: string) => {
      if (!message) return;
      this._removeItemDatasource([_id]);
    });
  }

  archive(
    { _id, procedure }: Communication,
    state: StateProcedure.Concluido | StateProcedure.Suspendido
  ) {
    // this.alertService.ConfirmAlert({
    //   title: `¿${
    //     state === StateProcedure.Concluido ? 'Concluir' : 'Suspender'
    //   } el tramite ${procedure.code}?`,
    //   text: 'El tramite pasara a su seccion de archivos',
    //   callback: (description) => {
    //     this.archiveService.create(_id, description, state).subscribe(() => {
    //       this._removeDatasourceItem(_id);
    //     });
    //   },
    // });
  }

  search(term: string) {
    this.index.set(0);
    this.filterForm.patchValue({ term });
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

  get StateProcedure() {
    return StateProcedure;
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

  filter() {
    this.index.set(0);
    this.isOpen = false;
    // this.getData();
  }

  reset() {
    this.isOpen = false;
    this.filterForm.reset();
    // this.getData();
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  private _accept(communications: communication[]): void {
    const selected = communications.map(({ _id }) => _id);
    const title =
      communications.length === 1
        ? `¿Aceptar tramite ${communications[0].procedure.code}?`
        : `¿Aceptar los tramites seleccionados`;
    this.alertService
      .confirmDialog({
        title,
        description:
          'IMPORTANTE: Solo debe aceptar tramites que haya recibido en fisico',
      })
      .pipe(
        filter((result) => result),
        switchMap(() => this.inboxService.accept(selected))
      )
      .subscribe(() => {
        this.datasource.update((values) => {
          values.map((item, index) => {
            if (selected.includes(item._id)) {
              values[index].status = StatusMail.Received;
            }
            return item;
          });
          return [...values];
        });
      });
  }

  private _reject(communications: communication[]): void {
    const selected = communications.map(({ _id }) => _id);
    this.alertService
      .descriptionDialog({
        title:
          selected.length === 1
            ? `¿Rechazar tramite ${communications[0].procedure.code}?`
            : `¿Rechazar los tramites seleccionados?`,
        description: 'Ingrese el motivo del rechazo',
      })
      .pipe(
        filter((term) => !!term),
        switchMap((description) =>
          this.inboxService.reject(selected, description!)
        )
      )
      .subscribe(() => {
        this._removeItemDatasource(selected);
      });
  }

  private _listenCommunications(): void {
    this.socketService
      .listenCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((communication) => {
        this.datasource.update((values) => {
          if (values.length === this.limit()) values.pop();
          return [communication, ...values];
        });
        this.datasize.update((length) => (length += 1));
      });
  }

  private _listenCancelDispatches() {
    this.socketService
      .listenCancelCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this.datasource.update((values) =>
          values.filter((el) => el._id !== id)
        );
        this.datasize.update((value) => (value -= 1));
      });
  }

  private _saveCache(): void {
    this.cacheService.save('inbox', {
      datasource: this.datasource(),
      datasize: this.datasize(),
      limit: this.limit(),
      index: this.index(),
      form: this.filterForm.value,
    });
  }

  private _loadCache(): void {
    const cache = this.cacheService.load('inbox');
    if (!cache) return this.getData();
    this.datasource.set(cache.datasource);
    this.datasize.set(cache.datasize);
    this.limit.set(cache.limit);
    this.index.set(cache.index);
    this.filterForm.patchValue(cache.form);
  }

  private _removeItemDatasource(ids: string[]): void {
    this.datasource.update((values) =>
      values.filter((el) => !ids.includes(el._id))
    );
    this.datasize.update((length) => (length -= ids.length));
    this.selection.clear();
    if (this.datasource().length === 0 && this.datasize() > 0) {
      this.getData();
    }
  }
}
