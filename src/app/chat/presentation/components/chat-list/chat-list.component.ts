import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../domain';

interface ChatItem {
  name: string;
  date?: Date;
  message?: string;
  id?: string;
  type: 'user' | 'chat';
}

@Component({
  selector: 'chat-list',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-grey-lighter flex-1 overflow-auto">
      @for (item of items(); track $index) {
      <div
        class="px-3 flex items-center bg-grey-light cursor-pointer hover:bg-grey-lighter transition"
      >
        <!-- Avatar -->
        <div class="relative">
          <img
            class="h-12 w-12 rounded-full"
            src="images/avatar.png"
            alt="avatar"
          />
        </div>

        <!-- Info -->
        <div class="ml-4 flex-1 border-b border-grey-lighter py-4 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-grey-darkest font-medium truncate">
              {{ item.name | titlecase }}
            </p>
            <p class="text-xs text-grey-darkest whitespace-nowrap">
              {{ item.createdAt | date }}
            </p>
          </div>

          <div class="flex items-center justify-between mt-1">
            <!-- Mensaje truncado -->
            <p
              class="text-grey-dark text-sm truncate max-w-[85%]"
              title="{{ item.lastMessage.text }}"
            >
              {{ item.lastMessage.text }}
            </p>

            <!-- Burbuja de notificación -->
            @if (item.unreadCount > 0) {
            <span
              class="ml-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {{ item.unreadCount }}
            </span>
            }
          </div>
        </div>
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  items = input.required<Chat[]>();

  ngOnInit() {}
}
