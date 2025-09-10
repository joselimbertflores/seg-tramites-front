import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ChatListComponent, ChatWindowComponent } from '../../components';
import { ChatOverlayService, ChatService } from '../../services';
import { Chat } from '../../../domain';

@Component({
  selector: 'app-chat-layout',
  imports: [CommonModule, ChatListComponent, ChatWindowComponent],
  templateUrl: './chat-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatLayoutComponent {
  private chatService = inject(ChatService);
  private chatOverlayService = inject(ChatOverlayService);
  private destroyRef = inject(DestroyRef);

  chats = signal<Chat[]>([]);
  currentChat = signal<Chat | null>(null);
  searchTerm = signal<string>('');

  ngOnInit() {
    this.getChats();
    this.listenForNewMessages();
    this.listenForChatSeen();
    this.closeChatOverlay();
  }

  getChats(): void {
    this.chatService.getChats().subscribe((chats) => {
      this.chats.set(chats);
    });
  }

  selectChat(chat: Chat): void {
    if (chat.id === this.currentChat()?.id) return;

    if (chat.unreadCount > 0) {
      chat.unreadCount = 0;
      this.chatService.markChatAsRead(chat.id).subscribe();
    }
    this.currentChat.set(chat);
  }

  setNewChat(chat: Chat): void {
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

  handleSendMessage(chat: Chat) {
    this.searchTerm.set('');
    this.setNewChat(chat);
  }

  private listenForNewMessages(): void {
    this.chatService.listenMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ chat }) => {
        if (chat.id === this.currentChat()?.id) {
          // * chatService.markChatAsRead for update isRead property => chat-window is the component call this method
          // * This componet only reset unreadCount
          chat.unreadCount = 0;
        }
        this.setNewChat(chat);
      });
  }

  private listenForChatSeen(): void {
    this.chatService.listenReadMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chatId) => {
        // * currentChat lastMessage is update by chat window
        this.chats.update((values) => {
          const index = values.findIndex(({ id }) => id === chatId);
          if (index !== -1 && values[index].lastMessage) {
            values[index].lastMessage.isRead = true;
          }
          return [...values];
        });
      });
  }

  private closeChatOverlay() {
    this.chatOverlayService.closeAccountChat();
  }
}
