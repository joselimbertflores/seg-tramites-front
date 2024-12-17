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

import { ProcessService } from '../../../../../communications/presentation/services';
import { communication } from '../../../../../communications/infrastructure';
import { BackButtonDirective } from '../../../../../shared';
import { ExternalProcedure } from '../../../../domain';
import {
  WorkflowListComponent,
  WorkflowGraphComponent,
} from '../../../components';

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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ExternalDetailComponent implements OnInit {
  @Input('id') procedureId: string;
  private processService = inject(ProcessService);
  
  procedure = signal<ExternalProcedure | null>(null);
  workflow = signal<communication[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this._getProcedureData(this.procedureId).subscribe(
      ([procedure, workflow]) => {
        this.procedure.set(procedure as ExternalProcedure);
        this.workflow.set(workflow);
        this.isLoading.set(false);
      }
    );
  }

  private _getProcedureData(procedureId: string) {
    return forkJoin([
      this.processService.getProcedure(procedureId),
      this.processService.getWorkflow(procedureId),
    ]);
  }
}
