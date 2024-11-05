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
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { switchMap } from 'rxjs';

import { CommunicationService } from '../../../services';
import { communication } from '../../../../infrastructure';
import { BackButtonDirective } from '../../../../../shared';
import ExternalDetailComponent from '../../../../../procedures/presentation/pages/externals-manage/external-detail/external-detail.component';

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
    ExternalDetailComponent,
  ],
  templateUrl: './communication-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationDetailComponent {
  @Input('id') communicationId: string;
  private communicationService = inject(CommunicationService);
  communication = signal<communication | null>(null);

  ngOnInit(): void {
    // this.route.paramMap
    //   .pipe(
    //     switchMap((params) =>
    //       this.communicationService.getOne(params.get('id')!)
    //     )
    //   )
    //   .subscribe((comm) => {
    //     this.communication.set(comm);
    //   });
    console.log(this.communicationId);
  }

  private _getProcedureData(procedureId: string) {
    // return forkJoin([this.externalService.getOne(procedureId)]);
  }
}
