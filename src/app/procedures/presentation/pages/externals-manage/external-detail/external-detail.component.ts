import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { BackButtonDirective } from '../../../../../shared';
import { ExternalProcedure } from '../../../../domain';
import { ExternalService } from '../../../services';

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
  private route = inject(ActivatedRoute);
  private externalService = inject(ExternalService);
  procedure = signal<ExternalProcedure | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(switchMap((params) => this._getProcedureData(params.get('id')!)))
      .subscribe(([procedure]) => {
        this.procedure.set(procedure);
      });
  }

  private _getProcedureData(procedureId: string) {
    return forkJoin([this.externalService.getOne(procedureId)]);
  }
}
