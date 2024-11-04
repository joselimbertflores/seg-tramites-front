import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin, switchMap } from 'rxjs';

import { InternalService } from '../../../services';
import { InternalProcedure } from '../../../../domain';
import { BackButtonDirective } from '../../../../../shared';

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
  private route = inject(ActivatedRoute);
  private internalService = inject(InternalService);
  procedure = signal<InternalProcedure | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(switchMap((params) => this._getProcedureData(params.get('id')!)))
      .subscribe(([procedure]) => {
        this.procedure.set(procedure);
      });
  }

  private _getProcedureData(procedureId: string) {
    return forkJoin([this.internalService.getOne(procedureId)]);
  }
}
