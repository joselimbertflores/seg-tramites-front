import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'detail-skeleton',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="h-[calc(100vh-128px)] w-full p-6">
      <div
        class="flex items-center justify-center w-full h-full rounded-2xl"
        style="background-color: var(--mat-sys-surface-container-highest);"
      >
        <mat-spinner></mat-spinner>

        <p>Cargandoi</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailSkeletonComponent {}
