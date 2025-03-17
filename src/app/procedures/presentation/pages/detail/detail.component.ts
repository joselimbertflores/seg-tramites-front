import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

import { forkJoin } from 'rxjs';

import { ProcessService } from '../../../../communications/presentation/services';
import { communication } from '../../../../communications/infrastructure';
import {
  ExternalProcedure,
  InternalProcedure,
  Procedure,
  procedureGroup,
  ProcurementProcedure,
} from '../../../domain';
import {
  ExternalDescriptionComponent,
  InternalDescriptionComponent,
  ProcurementDescriptionComponent,
  WorkflowGraphComponent,
  WorkflowListComponent,
} from '../../components';
import { BackButtonDirective } from '../../../../shared';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    BackButtonDirective,
    WorkflowListComponent,
    WorkflowGraphComponent,
    ExternalDescriptionComponent,
    InternalDescriptionComponent,
    ProcurementDescriptionComponent,
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button backButton>
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span class="ml-4">Detalle tramite</span>
    </mat-toolbar>

    <div class="sm:px-4">
      <mat-tab-group
        mat-stretch-tabs="false"
        mat-align-tabs="start"
        dynamicHeight="true"
      >
        <mat-tab label="Descripcion">
          @if(procedure()){ @switch (procedure()?.group) { @case
          (groupEnum.External) {
          <external-description [data]="external" />
          } @case (groupEnum.Internal) {
          <internal-description [data]="internal" />
          } @case (groupEnum.Procurement) {
          <procurement-description [data]="procurement" />
          } @default {
          <p>Group procedure is not defined</p>
          } } }
        </mat-tab>
        @if (workflow().length>0) {
        <mat-tab label="Flujo de trabajo">
          <workflow-list [workflow]="workflow()" />
        </mat-tab>
        <mat-tab label="Flujo de trabajo grafico">
          <workflow-graph [workflow]="workflow()" />
        </mat-tab>
        }
      </mat-tab-group>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DetailComponent {
  private processService = inject(ProcessService);

  @Input('id') procedureId: string;
  @Input('group') group: string;

  procedure = signal<Procedure | null>(null);
  workflow = signal<any[]>([]);

  public groupEnum = procedureGroup;

  ngOnInit(): void {
    this.getProcedureData().subscribe(([procedure, workflow]) => {
      this.procedure.set(procedure);
      this.workflow.set(workflow);
    });
  }

  private getProcedureData() {
    return forkJoin([
      this.processService.getProcedure(this.procedureId, this.group),
      this.processService.getWorkflow(this.procedureId),
    ]);
  }

  get external() {
    return this.procedure() as ExternalProcedure;
  }

  get internal() {
    return this.procedure() as InternalProcedure;
  }

  get procurement() {
    return this.procedure() as ProcurementProcedure;
  }
}
