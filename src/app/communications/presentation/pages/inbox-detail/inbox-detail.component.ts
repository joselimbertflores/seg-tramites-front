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

import { filter, finalize, forkJoin, switchMap, tap } from 'rxjs';

import { InboxService, ProcessService } from '../../services';
import {
  AlertService,
  CacheService,
  BackButtonDirective,
} from '../../../../shared';
import {
  WorkflowGraphComponent,
  WorkflowListComponent,
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
import { Communication, inboxCache } from '../../../domain';

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
    WorkflowListComponent,
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
        switchMap(() => this.inboxService.accept([this.communicationId]))
      )
      .subscribe({
        // next: ({ ids, date }) => {
        //   const id = ids[0];
        //   const receivedDate = new Date(date);
        //   this.data.update((value) =>
        //     value!.copyWith({ status: 'received', receivedDate })
        //   );
        //   this.updateStatusItemCache(id, { status: 'received', receivedDate });
        // },
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
        next: ({ itemIds }) => {
          // this.removeItemCache(itemIds);
          this.backLocation();
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.handleHttpError(error);
          }
        },
      });
  }

  get external() {
    return this.procedure() as ExternalProcedure;
  }

  get internal() {
    return this.procedure() as InternalProcedure;
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

  private updateStatusItemCache(id: string, update: Partial<Communication>) {
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
      // case 404:
      //   this.alertService.messageDialog({
      //     title: 'Elemento no encontrado',
      //     description: 'El envio del tramite ha sido cancelado',
      //   });
      //   const {
      //     ids: [id],
      //   } = error.error as notFoundError;
      //   this.removeItemCache(id);
      //   this.backLocation();
      //   break;
      // case 422:
      //   const { items } = error.error as invalidError;
      //   this.alertService.messageDialog({
      //     title: 'Elemento actual invalido',
      //     description: items[0].reason,
      //   });
      //   break;
      default:
        break;
    }
  }

  private backLocation() {
    this.cacheService.keepAlive.set(true);
    this.localtion.back();
  }
}
