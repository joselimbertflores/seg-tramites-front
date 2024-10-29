import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { filter, forkJoin, switchMap } from 'rxjs';

import {
  Communication,
  StatusMail,
  StateProcedure,
} from '../../../../domain/models';
import { PaginatorComponent } from '../../../../presentation/components';
import {
  InboxService,
  SocketService,
  AlertService,
  ProcedureService,
  PdfService,
  ArchiveService,
  CacheService,
} from '../../../../presentation/services';
import { SearchInputComponent } from '../../../../shared';
import { communication } from '../../../infrastructure';
import {
  SubmissionDialogComponent,
  TransferDetails,
} from './submission-dialog/submission-dialog.component';

export interface InboxCache {
  datasource: Communication[];
  datasize: number;
  status?: StatusMail;
  text: string;
}
@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatToolbarModule,
    PaginatorComponent,
    SearchInputComponent,
  ],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InboxComponent implements OnInit {
  private inboxService = inject(InboxService);
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private dialog = inject(MatDialog);
  private procedureService = inject(ProcedureService);
  private pdfService = inject(PdfService);
  private archiveService = inject(ArchiveService);
  private cacheService: CacheService<InboxCache> = inject(CacheService);

  public displayedColumns: string[] = [
    'group',
    'code',
    'reference',
    'emitter',
    'outboundDate',
    'options',
  ];
  public datasize = signal<number>(0);
  public datasource = signal<communication[]>([]);
  public term: string = '';
  public status?: StatusMail;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.saveCache();
    });
  }
  ngOnInit(): void {
    this._listenCommunications();
    this.listenCancelDispatches();
    // this.loadCache();
    this.getData();
  }

  getData(): void {
    this.inboxService
      .findAll(this.limit, this.offset, this.status)
      .subscribe((data) => {
        console.log(data);
        this.datasource.set(data.mails);
        this.datasize.set(data.length);
      });
  }

  applyStatusFilter(status: StatusMail): void {
    this.cacheService.pageIndex.set(0);
    this.status = status;
    this.getData();
  }

  applyTextFilter(term: string): void {
    this.cacheService.pageIndex.set(0);
    this.term = term;
    this.getData();
  }

  changePage(params: { limit: number; index: number }) {
    this.cacheService.pageSize.set(params.limit);
    this.cacheService.pageIndex.set(params.index);
    this.getData();
  }

  accept(communication: communication): void {
    this.alertService
      .confirmDialog({
        title: `¿Aceptar tramite ${communication.procedure.code}?`,
        description:
          'IMPORTANTE: Solo debe aceptar tramites que haya recibido en fisico',
      })
      .pipe(
        filter((result) => result),
        switchMap(() => this.inboxService.accept(communication._id))
      )
      .subscribe(() => {
        this.datasource.update((values) => {
          const index = values.findIndex((el) => el._id === communication._id);
          values[index].status = StatusMail.Received;
          return [...values];
        });
      });
  }

  reject({ _id, procedure }: communication): void {
    this.alertService
      .descriptionDialog({
        title: `¿Rechazar tramite ${procedure.code}?`,
        description: 'Ingrese el motivo del rechazo',
      })
      .pipe(
        filter((term) => !!term),
        switchMap((description) => this.inboxService.reject(_id, description!))
      )
      .subscribe(() => {
        this._removeDatasourceItem(_id);
      });
  }

  send(communication: communication) {
    const data: TransferDetails = {
      communication: { id: communication._id, status: communication.status },
      attachmentsCount: communication.attachmentsCount,
      procedureId: communication.procedure._id,
      isOriginal: communication.isOriginal,
      code: communication.procedure.code,
    };
    const dialogRef = this.dialog.open(SubmissionDialogComponent, {
      maxWidth: '1200px',
      width: '1200px',
      data,
    });
    dialogRef.afterClosed().subscribe((message: string) => {
      if (!message) return;
      // this._removeDatasourceItem(_id);
    });
  }

  archive(
    { _id, procedure }: Communication,
    state: StateProcedure.Concluido | StateProcedure.Suspendido
  ) {
    this.alertService.ConfirmAlert({
      title: `¿${
        state === StateProcedure.Concluido ? 'Concluir' : 'Suspender'
      } el tramite ${procedure.code}?`,
      text: 'El tramite pasara a su seccion de archivos',
      callback: (description) => {
        this.archiveService.create(_id, description, state).subscribe(() => {
          this._removeDatasourceItem(_id);
        });
      },
    });
  }

  generateRouteMap({ procedure }: Communication) {
    forkJoin([
      this.procedureService.getDetail(procedure._id, procedure.group),
      this.procedureService.getWorkflow(procedure._id),
    ]).subscribe((resp) => {
      this.pdfService.generateRouteSheet(resp[0], resp[1]);
    });
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

  get StateProcedure() {
    return StateProcedure;
  }

  private saveCache(): void {
    // this.cacheService.resetPagination();
    // const cache: InboxCache = {
    //   datasource: this.datasource(),
    //   datasize: this.datasize(),
    //   text: this.term,
    //   status: this.status,
    // };
    // this.cacheService.save('inbox', cache);
  }

  private loadCache(): void {
    // const cache = this.cacheService.load('inbox');
    // if (!this.cacheService.keepAliveData() || !cache) {
    //   this.getData();
    //   return;
    // }
    // this.datasource.set(cache.datasource);
    // this.datasize.set(cache.datasize);
    // this.status = cache.status;
    // this.term = cache.text;
  }

  private _listenCommunications() {
    this.socketService
      .listenCommunications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((communication) => {
        this.datasource.update((values) => {
          if (values.length === this.limit) values.pop();
          return [communication, ...values];
        });
        this.datasize.update((length) => (length += 1));
      });
  }

  private listenCancelDispatches() {
    this.socketService
      .listenCancelDispatches()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this._removeDatasourceItem(id));
  }

  private _removeDatasourceItem(id: string): void {
    this.datasource.update((values) => values.filter((el) => el._id !== id));
    this.datasize.update((length) => (length -= 1));
  }
}
