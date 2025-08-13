import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

interface ChatItem {
  name: string;
  date: Date;
  message?: string;
  chatId?: string;
}

@Component({
  selector: 'chat-list',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-grey-lighter flex-1 overflow-auto">
      @for (item of items(); track $index) {
      <div class="px-3 flex items-center bg-grey-light cursor-pointer" [routerLink]="[ item.chatId ?? 'new']">
        <div>
          <img class="h-12 w-12 rounded-full" src="images/avatar.png" />
        </div>
        <div class="ml-4 flex-1 border-b border-grey-lighter py-4">
          <div class="flex items-bottom justify-between">
            <p class="text-grey-darkest">{{ item.name }}</p>
            <p class="text-xs text-grey-darkest">{{ item.date | date }}</p>
          </div>
          <p class="text-grey-dark mt-1 text-sm">
            {{ item.message }}
          </p>
        </div>
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  items = input.required<ChatItem[]>();
}
