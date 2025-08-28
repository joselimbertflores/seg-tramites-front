import {
  input,
  inject,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MessageContentComponent } from '../message-content/message-content.component';
import { MessageStatusComponent } from '../message-status/message-status.component';
import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { Message } from '../../../domain';

@Component({
  selector: 'chat-bubble',
  imports: [CommonModule, MessageStatusComponent, MatIconModule, MessageContentComponent],
  template: `
    @if(message().sender.id === userId){
      <div class="flex justify-end mb-2">
        <div class="rounded-lg space-y-2 py-2 px-4 min-w-[100px] bubble bubble-right" >
          <message-content [message]="message()"/>
          <p class="text-right text-xs text-grey-dark mt-1 flex items-center justify-end">
            {{ message().sentAt | date : 'shortTime' }}
            <span class="ml-1 flex items-center">
              <message-status [isRead]="message().isRead"/>
            </span>
          </p>
        </div>
      </div>
    } 
    @else {
      <div class="flex mb-2">
        <div class="rounded-lg space-y-2 py-2 px-4 min-w-[100px] bubble bubble-left">
          <message-content [message]="message()"/>
          <p class="text-right text-xs text-grey-dark mt-1">
            {{ message().sentAt | date : 'shortTime' }}
          </p>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles:`
    .bubble-right {
      background-color: var(--mat-sys-secondary-container);
    }
    .bubble-left {
      background-color: var(--mat-sys-surface-container-high);
    }
  `
})
export class ChatBubbleComponent {
  userId = inject(AuthService).user()?.userId;
  message = input.required<Message>();
}
