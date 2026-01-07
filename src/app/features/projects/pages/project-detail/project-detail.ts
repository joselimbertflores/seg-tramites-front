import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';

import { ProjectDataSource } from '../../services';
import { AlertService } from '../../../../shared';

@Component({
  selector: 'app-project-detail',
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './project-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectDetail {
  id = input('id');
  private projectDataSource = inject(ProjectDataSource);
  private alertService = inject(AlertService);

  project = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.projectDataSource.getDetail(params.id),
  });

  confirm(index: number) {
    this.alertService
      .confirmDialog({
        title: 'Confirmar acción',
        description:
          '¿Estás seguro de que deseas marcar este proyecto como verificado?',
      })
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.projectDataSource.confirm(this.id(), index))
      )
      .subscribe((resp) => {
        this.project.value.update((values) => {
          values.requirements[index].completed = resp.completed;
          values.requirements[index].officer = resp.officer;
          values.requirements[index].date = resp.date;
          return { ...values };
        });
      });
  }
}
