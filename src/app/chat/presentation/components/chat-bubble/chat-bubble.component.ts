import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { CommonModule } from '@angular/common';
import { Message } from '../../../domain';

@Component({
  selector: 'chat-bubble',
  imports: [CommonModule],
  template: `
    @if(message().sender.id === userId){
      <div class="flex justify-end mb-2">
        <div class="rounded-lg py-2 px-3" style="background-color: #e2f7cb">
          <p class="text-sm mt-1">{{ message().content }}</p>
          <p class="text-right text-xs text-grey-dark mt-1">
            {{ message().sentAt | date : 'shortTime' }}
          </p>
        </div>
      </div>
    } 
    @else {
      <div class="flex mb-2">
        <div class="rounded-lg py-2 px-3" style="background-color: #f2f2f2">
          <p class="text-sm text-teal">{{ message().sender.fullname }}</p>
          <p class="text-sm mt-1">
            {{ message().content }}
          </p>
          <p class="text-right text-xs text-grey-dark mt-1">
            {{ message().sentAt | date : 'shortTime' }}
          </p>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatBubbleComponent {
  userId = inject(AuthService).user()?.userId;
  message = input.required<Message>();
}
