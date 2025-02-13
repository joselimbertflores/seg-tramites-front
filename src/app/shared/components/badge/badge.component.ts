import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type severity = 'success' | 'danger' | 'info' | 'warning' | 'purple';

@Component({
  selector: 'badge',
  imports: [CommonModule, MatIconModule],
  template: `
    <span
      class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5"
      [ngClass]="severityClass()"
    >
      @if(icon()){
      <mat-icon class="mr-2">{{icon()}}</mat-icon>
      }
      <span class="whitespace-nowrap text-sm">{{ message() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  message = input.required<string>();
  severity = input<severity>('info');
  svgPath = input<string>();
  icon = input<string>();

  severityClass = computed<string>(() => {
    switch (this.severity()) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'danger':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'purple':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-200';
    }
  });
}
