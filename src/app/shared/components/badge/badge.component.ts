import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

type severity = 'success' | 'danger' | 'info' | 'warning' | 'purple';

@Component({
  selector: 'badge',
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5"
      [ngClass]="severityClass()"
    >
      <span class="whitespace-nowrap text-sm font-medium">{{ message() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  message = input.required<string>();
  severity = input<severity>('info');

  severityClass = computed<string>(() => {
    switch (this.severity()) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700';
      case 'danger':
        return 'bg-red-100 text-red-700 border border-red-400';
      case 'warning':
        return 'bg-amber-100 text-amber-700 border border-amber-400';
      case 'purple':
        return 'bg-purple-100 text-purple-700 border border-purple-400';
      default:
        return 'bg-gray-100 text-gray-200';
    }
  });
}
