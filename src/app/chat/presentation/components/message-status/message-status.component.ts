import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'message-status',
  imports: [],
  template: `
    @if(isRead()){
      <svg
        class="w-6 h-6 text-sky-400"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 12.9L7.14286 16.5L15 7.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 7.5625L11.4283 16.5625L11 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    } 
    @else {
      <svg
        class="w-6 h-6 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 12.9L7.14286 16.5L15 7.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 7.5625L11.4283 16.5625L11 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageStatusComponent {
  isRead = input.required<boolean>();
}
