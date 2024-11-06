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

import { ProcessService } from '../../../../../communications/presentation/services';
import { BackButtonDirective } from '../../../../../shared';
import { InternalProcedure } from '../../../../domain';

@Component({
  selector: 'app-internal-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
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
    this._getProcedureData(this.procedureId).subscribe(
      ([procedure, workflow]) => {
        this.procedure.set(procedure as InternalProcedure);
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
