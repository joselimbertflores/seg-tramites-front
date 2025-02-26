import { CommonModule } from '@angular/common';
import {
  Input,
  inject,
  OnInit,
  signal,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';

import { communication } from '../../../../communications/infrastructure';
import { BackButtonDirective } from '../../../../shared';
import { ExternalProcedure } from '../../../domain';
import {
  WorkflowListComponent,
  WorkflowGraphComponent,
} from '../../components';
import { ExternalService } from '../../services';

@Component({
  selector: 'external-detail',
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    BackButtonDirective,
    WorkflowListComponent,
    WorkflowGraphComponent,
  ],
  templateUrl: './external-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExternalDetailComponent implements OnInit {
  @Input('id') procedureId: string;
  private externalService = inject(ExternalService);

  procedure = signal<ExternalProcedure | null>(null);
  workflow = signal<communication[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this._getProcedureData(this.procedureId).subscribe(([procedure]) => {
      this.procedure.set(procedure);
      // this.workflow.set(workflow);
      this.isLoading.set(false);
    });
  }

  private _getProcedureData(procedureId: string) {
    return forkJoin([
      this.externalService.getDetail(procedureId),
      // this.externalService.getWorkflow(procedureId),
    ]);
  }
}
