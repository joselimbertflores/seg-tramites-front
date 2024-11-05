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
import { forkJoin, switchMap } from 'rxjs';

import { BackButtonDirective } from '../../../../../shared';
import { ExternalProcedure } from '../../../../domain';
import { ProcessService } from '../../../../../communications/presentation/services';

@Component({
  selector: 'external-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    BackButtonDirective,
  ],
  templateUrl: './external-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExternalDetailComponent implements OnInit {
  @Input('id') procedureId: string;
  private processService = inject(ProcessService);
  procedure = signal<ExternalProcedure | null>(null);

  ngOnInit(): void {
    this._getProcedureData(this.procedureId).subscribe(
      ([procedure, workflow]) => {
        this.procedure.set(procedure as ExternalProcedure);
        console.log(workflow);
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
