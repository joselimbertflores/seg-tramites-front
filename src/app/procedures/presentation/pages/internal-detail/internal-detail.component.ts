import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';

import { ProcessService } from '../../../../communications/presentation/services';
import { BackButtonDirective } from '../../../../shared';
import { InternalProcedure, procedureGroup } from '../../../domain';

@Component({
  selector: 'app-internal-detail',
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    BackButtonDirective,
  ],
  templateUrl: './internal-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InternalDetailComponent {
  private processService = inject(ProcessService);

  @Input('id') procedureId: string;
  procedure = signal<InternalProcedure | null>(null);

  ngOnInit(): void {
    this.getProcedureData(this.procedureId).subscribe(([procedure]) => {
      // this.procedure.set(procedure as InternalProcedure);
      console.log(procedure);
    });
  }

  private getProcedureData(procedureId: string) {
    return forkJoin([
      this.processService.getWorkflow(procedureId),
      // this.processService.getProcedure(procedureId, procedureGroup.Internal),
    ]);
  }
}
