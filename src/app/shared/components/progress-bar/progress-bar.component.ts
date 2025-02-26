import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
@Component({
  selector: 'progress-bar',
  imports: [MatProgressBarModule],
  template: ` <mat-progress-bar mode="indeterminate" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {}
