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

import { CommunicationService, ProcessService } from '../../../services';
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
} from '../../../components';

@Component({
  selector: 'app-communication-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatToolbarModule,
    BackButtonDirective,
    WorkflowListComponent,
    WorkflowGraphComponent,
    InternalCommunicationComponent,
    ExternalCommunicationComponent,
  ],
  templateUrl: './communication-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationDetailComponent {
  @Input('id') communicationId: string;
  private communicationService = inject(CommunicationService);
  private procedureService = inject(ProcessService);

  communication = signal<communication | null>(null);
  procedure = signal<Procedure | null>(null);
  workflow = signal<communication[]>([]);

  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.communicationService
      .getOne(this.communicationId)
      .pipe(
        tap((comm) => this.communication.set(comm)),
        switchMap((comm) => this._getProcedureData(comm.procedure._id))
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

  private _getProcedureData(procedureId: string) {
    return forkJoin([
      this.procedureService.getProcedure(procedureId),
      this.procedureService.getWorkflow(procedureId),
    ]);
  }
}
