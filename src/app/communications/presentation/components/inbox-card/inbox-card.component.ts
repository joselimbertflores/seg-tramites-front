import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import { Communication } from '../../../domain';
import { AlertMessageComponent } from '../../../../shared';

@Component({
  selector: 'inbox-card',
  imports: [CommonModule, MatCardModule, AlertMessageComponent],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <img mat-card-avatar src="images/icons/account.png" />
        <mat-card-title>
          {{ data().sender.fullname | titlecase }}
        </mat-card-title>
        <mat-card-subtitle>
          {{ data().sender.jobtitle }}
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="py-2">
          <p class="font-medium">{{ data().sentDate | date : 'fullDate' }}</p>
        </div>
        <div>
          {{ data().reference }}
        </div>
        <div></div>
        @if(data().status==='pending'){
        <div class="mt-3">
          <alert-message
            title="Este tramite aun no ha sido recibido"
            severity="warn"
          />
        </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxCardComponent {
  data = input.required<Communication>();
}
