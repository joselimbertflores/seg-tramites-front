import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { filter, forkJoin, switchMap, tap } from 'rxjs';

import { InboxService, ProcessService } from '../../services';
import { communication } from '../../../infrastructure';
import { AlertService, BackButtonDirective } from '../../../../shared';
import {
  WorkflowGraphComponent,
  WorkflowListComponent,
} from '../../../../procedures/presentation/components';
import {
  ExternalProcedure,
  InternalProcedure,
  Procedure,
  procedureGroup,
} from '../../../../procedures/domain';
import {
  ExternalCommunicationComponent,
  InternalCommunicationComponent,
  ProcurementCommunicationComponent,
  InboxCardComponent,
} from '../../components';
import { communcationStatus, Communication } from '../../../domain';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  @Input('id') communicationId: string;
  private inboxService = inject(InboxService);
  private processService = inject(ProcessService);
  private alertService = inject(AlertService);

  communication = signal<Communication | null>(null);
  procedure = signal<Procedure | any | null>(null);
  workflow = signal<communication[]>([]);

  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.inboxService
      .getOne(this.communicationId)
      .pipe(
        tap((data) => this.communication.set(data)),
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

  accept(): void {
    this.alertService
      .confirmDialog({
        title: `¿Aceptar tramite ${this.communication()?.procedure.code}?`,
        description:
          'IMPORTANTE: Solo debe aceptar tramites que haya recibido en fisico',
      })
      .pipe(
        filter((result) => result),
        switchMap(() => this.inboxService.accept([this.communicationId]))
      )
      .subscribe({
        next: () => {
          this.communication.update((values) => {
            values!.status = communcationStatus.Received;
            return values;
          });
        },
        error: (error) => {
          // if (error instanceof HttpErrorResponse && error.status === 409) {
          //   const { toRemove = [], toUpdated = [] } = error.error;
          //   this.removeItems(toRemove);
          //   this.setStatusItems(toUpdated, communcationStatus.Received);
          // }
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
}
