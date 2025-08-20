import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatListComponent, ChatWindowComponent } from '../../components';
import { ChatService } from '../../services';
import { Chat } from '../../../domain';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, ChatListComponent, ChatWindowComponent],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent {
  private chatService = inject(ChatService);
  chats = signal<Chat[]>([]);
  selectedChat = signal<Chat | null>(null);
  chatIndex = signal<number>(0);

  ngOnInit() {
    this.getChats();
  }

  getChats(): void {
    this.chatService.geChats().subscribe((chats) => {
      this.chats.set(chats);
    });
  }

  onSelectChat(chat: Chat) {
    this.chatIndex.set(0);
    this.selectedChat.set(chat);
    if (chat.unreadCount > 0) {
      chat.unreadCount = 0;
      this.chatService.markChatAsRead(chat.id).subscribe();
    }
  }

  startChat(chat: Chat) {
    this.chats.update((chats) => {
      const index = chats.findIndex((item) => item.id === chat.id);
      if (index === -1) {
        chats.unshift(chat);
      } else {
        chats[index] = chat;
      }
      return [...chats].sort(
        (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
      );
    });
  }

  get currentChat() {
    return this.selectedChat()!;
  }
}
