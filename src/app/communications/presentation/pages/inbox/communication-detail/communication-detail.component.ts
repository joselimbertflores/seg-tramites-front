import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { switchMap } from 'rxjs';

import { CommunicationService } from '../../../services';
import { communication } from '../../../../infrastructure';
import { BackButtonDirective } from '../../../../../shared';

@Component({
  selector: 'app-communication-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    BackButtonDirective,
  ],
  templateUrl: './communication-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationDetailComponent {
  private route = inject(ActivatedRoute);
  private communicationService = inject(CommunicationService);
  communication = signal<communication | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) =>
          this.communicationService.getOne(params.get('id')!)
        )
      )
      .subscribe((comm) => {
        this.communication.set(comm);
      });
  }

  private _getProcedureData(procedureId: string) {
    // return forkJoin([this.externalService.getOne(procedureId)]);
  }
}
