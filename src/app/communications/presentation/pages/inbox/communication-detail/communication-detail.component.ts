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
import { forkJoin, switchMap, tap } from 'rxjs';

import { InboxService, ProcessService } from '../../../services';
import { communication } from '../../../../infrastructure';
import { BackButtonDirective } from '../../../../../shared';
import {
  WorkflowGraphComponent,
  WorkflowListComponent,
} from '../../../../../procedures/presentation/components';
import {
  ExternalProcedure,
  InternalProcedure,
  Procedure,
} from '../../../../../procedures/domain';
import {
  ExternalCommunicationComponent,
  InternalCommunicationComponent,
  ProcurementCommunicationComponent,
} from '../../../components';
import { Communication } from '../../../../domain';

@Component({
  selector: 'app-communication-detail',
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatToolbarModule,
    BackButtonDirective,
    WorkflowGraphComponent,
    InternalCommunicationComponent,
    ExternalCommunicationComponent,
    ProcurementCommunicationComponent,
  ],
  templateUrl: './communication-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationDetailComponent {
  @Input('id') communicationId: string;
  private inboxService = inject(InboxService);
  private procedureService = inject(ProcessService);

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
      .subscribe(([procedure]) => {
        this.procedure.set(procedure);
        this.isLoading.set(false);
      });
  }

  get external() {
    return this.procedure() as ExternalProcedure;
  }

  get internal() {
    return this.procedure() as InternalProcedure;
  }

  private getProcedure(procedureId: string, group: string) {
    return forkJoin([
      this.procedureService.getProcedure(procedureId, group),
      // this.procedureService.getWorkflow(procedureId),
    ]);
  }
}
