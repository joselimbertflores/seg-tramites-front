import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { filter, finalize, forkJoin, switchMap, tap } from 'rxjs';

import { InboxService, ProcessService } from '../../services';
import {
  AlertService,
  CacheService,
  BackButtonDirective,
} from '../../../../shared';
import {
  WorkflowGraphComponent,
  WorkflowPathsComponent,
} from '../../../../procedures/presentation/components';
import {
  ExternalProcedure,
  InternalProcedure,
  procedureGroup,
  Procedure,
} from '../../../../procedures/domain';
import {
  ProcurementCommunicationComponent,
  InternalCommunicationComponent,
  ExternalCommunicationComponent,
  InboxCardComponent,
} from '../../components';
import {
  communcationStatus,
  Communication,
  inboxCache,
  invalidCommunicationsError,
  notFoundCommunicationsError,
} from '../../../domain';
import {
  submissionData,
  SubmissionDialogComponent,
} from '../inbox/submission-dialog/submission-dialog.component';
import { ArchiveDialogComponent } from '../inbox/archive-dialog/archive-dialog.component';

@Component({
  selector: 'app-inbox-detail',
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatToolbarModule,
    BackButtonDirective,
    MatTooltipModule,
    WorkflowGraphComponent,
    InternalCommunicationComponent,
    ExternalCommunicationComponent,
    ProcurementCommunicationComponent,
    InboxCardComponent,
    WorkflowPathsComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './inbox-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export default class InboxDetailComponent {
  private inboxService = inject(InboxService);
  private processService = inject(ProcessService);
  private alertService = inject(AlertService);
  private cacheService: CacheService<inboxCache> = inject(CacheService);
  private localtion = inject(Location);
  private dialogRef = inject(MatDialog);

  @Input('id') communicationId: string;

  data = signal<Communication | null>(null);
  procedure = signal<Procedure | any | null>(null);
  workflow = signal<any[]>([]);

  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.getData();
  }

  accept(): void {
    this.alertService
      .confirmDialog({
        title: `¿Aceptar tramite ${this.data()?.procedure.code}?`,
        description: 'Solo debe aceptar tramites que haya recibido en fisico',
      })
      .pipe(
        filter((result) => result),
        switchMap(() => this.inboxService.accept([this.communication.id]))
      )
      .subscribe({
        next: ({ itemIds: [id], receivedDate }) => {
          const update = { status: communcationStatus.Received, receivedDate };
          this.data.update((value) => value!.copyWith(update));
          this.updateItemCache(id, update);
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.handleHttpError(error);
          }
        },
      });
  }

  reject(): void {
    this.alertService
      .descriptionDialog({
        title: `¿Rechazar tramite ${this.data()?.procedure.code}?`,
        placeholder: 'Ingrese una descripcion clara del motivo del rechazo',
      })
      .pipe(
        filter((description) => !!description),
        switchMap((description) =>
          this.inboxService.reject([this.communicationId], description!)
        )
      )
      .subscribe({
        next: ({ itemIds: [id] }) => {
          this.finalizeAndReturn(id);
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.handleHttpError(error);
          }
        },
      });
  }

  send() {
    const data: submissionData = {
      mode: 'forward',
      communicationId: this.communication.id,
      procedure: {
        id: this.communication.procedure.ref,
        code: this.communication.procedure.code,
      },
      attachmentsCount: this.communication.attachmentsCount,
      isOriginal: this.communication.isOriginal,
    };
    const dialogRef = this.dialogRef.open(SubmissionDialogComponent, {
      maxWidth: '1100px',
      width: '1100px',
      data,
    });
    dialogRef.afterClosed().subscribe((message: string) => {
      if (!message) return;
      this.finalizeAndReturn(this.communication.id);
    });
  }

  archive() {
    const dialogRef = this.dialogRef.open(ArchiveDialogComponent, {
      width: '600px',
      data: [this.communication],
    });
    dialogRef.afterClosed().subscribe((result: string[]) => {
      if (!result) return;
      this.finalizeAndReturn(this.communication.id);
    });
  }

  private getData() {
    this.isLoading.set(true);
    this.inboxService
      .getOne(this.communicationId)
      .pipe(
        tap((data) => this.data.set(data)),
        switchMap(({ procedure }) =>
          this.getProcedure(procedure.ref, procedure.group)
        ),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(([procedure, workflow]) => {
        this.procedure.set(procedure);
        this.workflow.set(workflow);
      });
  }

  private getProcedure(procedureId: string, group: procedureGroup) {
    return forkJoin([
      this.processService.getProcedure(procedureId, group),
      this.processService.getWorkflow(procedureId),
    ]);
  }

  private updateItemCache(id: string, update: Partial<Communication>) {
    const cache = this.cacheService.load('inbox');
    if (!cache) return;
    let { datasource, ...props } = cache;
    const index = datasource.findIndex((item) => item.id === id);
    if (index === -1) return;
    datasource[index] = datasource[index].copyWith(update);
    this.cacheService.save('inbox', { ...props, datasource });
  }

  private removeItemCache(id: string) {
    const cache = this.cacheService.load('inbox');
    if (!cache) return;
    const { datasource, datasize, ...props } = cache;
    this.cacheService.save('inbox', {
      ...props,
      datasize: datasize - 1,
      datasource: datasource.filter((item) => item.id !== id),
    });
  }

  private handleHttpError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 404:
        const {
          notFoundIds: [notFoundId],
        } = error.error as notFoundCommunicationsError;
        this.alertService.messageDialog({
          title: 'Elemento no encontrado',
          description: 'El remitente ha cancelado el envio',
        });
        this.finalizeAndReturn(notFoundId);
        break;

      case 422:
        const {
          invalidItems: [invalidItem],
        } = error.error as invalidCommunicationsError;
        this.alertService.messageDialog({
          title: 'El elemento seleccionado es invalido',
          description: `Tramite: ${invalidItem.code}`,
        });
        break;
      default:
        break;
    }
  }

  private finalizeAndReturn(id: string) {
    this.removeItemCache(id);
    this.cacheService.keepAlive.set(true);
    this.localtion.back();
  }

  get external() {
    return this.procedure() as ExternalProcedure;
  }

  get internal() {
    return this.procedure() as InternalProcedure;
  }

  get communication() {
    return this.data()!;
  }
}
