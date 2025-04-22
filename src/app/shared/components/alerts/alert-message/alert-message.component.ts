import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'alert-message',
  imports: [CommonModule],
  template: `
    <div
      class="border-s-4 p-4 rounded-lg flex items-start space-x-3"
      [ngClass]="{
        'bg-teal-50 border-teal-500 text-teal-800': severity() === 'success',
        'bg-blue-50 border-blue-500 text-blue-800': severity() === 'info',
        'bg-yellow-50 border-yellow-500 text-yellow-800': severity() === 'warning',
        'bg-red-50 border-red-500 text-red-800': severity() === 'error'
      }"
    >
      <!-- Icono -->
      <div class="shrink-0">
        <span
          class="inline-flex justify-center items-center size-8 rounded-full border-4"
          [ngClass]="{
            'border-teal-100 bg-teal-200 text-teal-800': severity() === 'success',
            'border-blue-100 bg-blue-200 text-blue-800': severity() === 'info',
            'border-yellow-100 bg-yellow-200 text-yellow-800': severity() === 'warning',
            'border-red-100 bg-red-200 text-red-800': severity() === 'error'
          }"
        >
          <ng-container [ngSwitch]="severity()">
            <svg
              *ngSwitchCase="'success'"
              class="size-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <svg
              *ngSwitchCase="'info'"
              class="size-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <svg
              *ngSwitchCase="'warning'"
              class="size-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <svg
              *ngSwitchCase="'error'"
              class="size-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ng-container>
        </span>
      </div>

      <!-- Contenido -->
      <div class="flex-1">
        <h3 class="font-semibold text-gray-800">
          {{ title() }}
        </h3>
        <p class="text-sm text-gray-700">{{ message() }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
  ],
})
export class AlertMessageComponent implements OnInit {
  severity = input.required<'success' | 'warning' | 'error' | 'info'>();
  title = input.required<string>();
  message = input<string>('');

  life = input<number>();
  close = output<void>();
  closable = input(false);

  timeoutID: NodeJS.Timeout;

  destroyRef = inject(DestroyRef).onDestroy(() => {
    clearInterval(this.timeoutID);
  });

  ngOnInit(): void {
    if (this.life()) {
      this.timeoutID = setTimeout(() => this.close.emit(), this.life());
    }
  }
}
