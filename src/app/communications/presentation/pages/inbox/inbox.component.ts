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
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  PdfService,
  SocketService,
  ArchiveService,
  CommunicationService,
} from '../../../../presentation/services';
import {
  AlertService,
  CacheService,
  SearchInputComponent,
} from '../../../../shared';
import { SubmissionDialogComponent } from './submission-dialog/submission-dialog.component';
import {
  communcationStatus,
  Communication,
  submissionDialogData,
} from '../../../domain';
import { procedureGroup } from '../../../../procedures/domain';
import { ArchiveDialogComponent } from './archive-dialog/archive-dialog.component';

interface cache {
  datasource: Communication[];
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
    MatButtonToggleModule,
    SearchInputComponent,
    FormsModule,
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
  private dialogRef = inject(MatDialog);
  private pdfService = inject(PdfService);
  private archiveService = inject(ArchiveService);
  private cacheService: CacheService<cache> = inject(CacheService);
  private formBuilder = inject(FormBuilder);

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
    { value: 'Contratacion', label: 'Contrataciones' },
  ];

  readonly documentTypes = [
    { value: true, label: 'Original' },
    { value: false, label: 'Copia' },
  ];

  constructor() {
    this._listenNewCommunications();
    this._listenCancelCommunications();
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
        term: this.term(),
        ...this.filterForm.value,
        ...(this.status() !== 'all' && { status: this.status() }),
      })
      .subscribe(({ communications, length }) => {
        this.datasource.set(communications);
        this.datasize.set(length);
      });
  }

  acceptMultiple(): void {
    this._accept(this.selection.selected);
  }

  acceptOne(item: Communication): void {
    this._accept([item]);
  }

  rejectOne(item: Communication): void {
    this._reject([item]);
  }

  rejectMultiple(): void {
    this._reject(this.selection.selected);
  }

  send({ id, procedure, isOriginal, attachmentsCount }: Communication) {
    const data: submissionDialogData = {
      communicationId: id,
      procedure: { id: procedure.ref, code: procedure.code },
      allowAttachDocument: true,
      attachmentsCount,
      isOriginal,
    };
    const dialogRef = this.dialogRef.open(SubmissionDialogComponent, {
      maxWidth: '900px',
      width: '900px',
      data,
    });
    dialogRef.afterClosed().subscribe((message: string) => {
      if (!message) return;
      this._removeItemsDatasource([id]);
    });
  }

  archive() {
    // this.dialog
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
    this.dialogRef.open(ArchiveDialogComponent, { width: '600px' });
  }

  search(term: string) {
    this.index.set(0);
    this.term.set(term);
    this.getData();
  }

  filter() {
    this.index.set(0);
    this.isOpen = false;
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
    console.log(this.selection.selected);
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

  get isButtonAcceptEnabled(): boolean {
    if (this.selection.selected.length === 0) return false;
    return this.selection.selected.every(({ status }) => status === 'received');
  }

  private _accept(communications: Communication[]): void {
    const selected = communications
      .filter(({ status }) => status === communcationStatus.Pending)
      .map(({ id }) => id);
    if (selected.length === 0) return;

    this.alertService
      .confirmDialog({
        title:
          communications.length === 1
            ? `¿Aceptar tramite ${communications[0].procedure.code}?`
            : `¿Aceptar los tramites seleccionados?`,
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
            if (selected.includes(item.id)) {
              values[index].status = communcationStatus.Received;
            }
            return item;
          });
          return [...values];
        });
      });
  }

  private _reject(communications: Communication[]): void {
    const selected = communications
      .filter(({ status }) => status === communcationStatus.Pending)
      .map(({ id }) => id);
    if (selected.length === 0) return;
    this.alertService
      .descriptionDialog({
        title:
          selected.length === 1
            ? `¿Rechazar tramite ${communications[0].procedure.code}?`
            : `¿Rechazar los tramites seleccionados?`,
        placeholder: 'Ingrese el motivo del rechazo',
      })
      .pipe(
        filter((description) => !!description),
        switchMap((description) =>
          this.inboxService.reject(selected, description!)
        )
      )
      .subscribe(() => {
        this._removeItemsDatasource(selected);
      });
  }

  private _listenNewCommunications(): void {
    this.socketService
      .listenNewCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((communication) => {
        this.datasource.update((values) => {
          if (values.length === this.limit()) values.pop();
          return [communication, ...values];
        });
        this.datasize.update((length) => (length += 1));
      });
  }

  private _listenCancelCommunications() {
    this.socketService
      .listenCancelCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        this._removeItemsDatasource([id]);
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

  private _removeItemsDatasource(ids: string[]): void {
    this.datasource.update((values) =>
      values.filter((el) => !ids.includes(el.id))
    );
    this.datasize.update((length) => (length -= ids.length));
    this.selection.clear();
    if (this.datasource().length === 0 && this.datasize() > 0) {
      this.getData();
    }
  }
}
