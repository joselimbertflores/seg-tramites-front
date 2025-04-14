import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { filter, forkJoin, switchMap, tap } from 'rxjs';

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
import { communcationStatus, Communication, inboxCache } from '../../../domain';

@Component({
  selector: 'app-inbox-detail',
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
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
  ],
  templateUrl: './inbox-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    this.isLoading.set(true);
    this.inboxService
      .getOne(this.communicationId)
      .pipe(
        tap((data) => this.data.set(data)),
        switchMap(({ procedure }) =>
          this.getProcedure(procedure.ref, procedure.group)
        )
      )
      .subscribe(([procedure, workflow]) => {
        this.procedure.set(procedure);
        this.workflow.set(workflow);
        this.isLoading.set(false);
      });
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
        next: ({ success, skipped }) => {
          const received = success?.[0];
          const invalid = skipped?.[0];
          if (invalid) {
            this.alertService.messageDialog({
              title: 'No se pudo aceptar el tramite',
              description: invalid.reason,
            });
            return;
          }
          if (received) {
            const receivedDate = new Date(received.date);
            this.updateStatusItem(communcationStatus.Received, receivedDate);
            const cache = this.cacheService.load('inbox');
            if (!cache) return;
            let { datasource, ...props } = cache;
            const index = datasource.findIndex(({ id }) => id === received.id);
            datasource[index] = datasource[index].copyWith({
              status: 'received',
              receivedDate,
            });
            this.cacheService.save('inbox', { ...props, datasource });
          }
        },
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
      .subscribe(() => {});
  }

  get external() {
    return this.procedure() as ExternalProcedure;
  }

  get internal() {
    return this.procedure() as InternalProcedure;
  }

  private getProcedure(procedureId: string, group: procedureGroup) {
    return forkJoin([
      this.processService.getProcedure(procedureId, group),
      this.processService.getWorkflow(procedureId),
    ]);
  }

  private updateStatusItem(status: communcationStatus, date?: Date) {
    this.data.update((value) =>
      value!.copyWith({
        status,
        receivedDate: date ? date : value?.receivedDate,
      })
    );
  }
}
