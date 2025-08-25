import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

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
  private destroyRef = inject(DestroyRef);


  chats = signal<Chat[]>([]);
  selectedChat = signal<Chat | null>(null);
  chatIndex = signal<number>(0);
  isChatSelected = computed(() => this.selectedChat() !== null);

  messages = rxResource({
    params: () => ({ chatId: this.selectedChat()?.id }),
    stream: ({ params: { chatId } }) => {
      if (!chatId) return of([]);
      return this.chatService.getChatMessages(chatId);
    },
    defaultValue: [],
  });



  ngOnInit() {
    this.getChats();
    this.listenMessages();
    this.litenMessageRead();
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

  listenMessages() {
    this.chatService
      .listenMessages()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ chat, message }) => {
        if (this.selectedChat() && this.selectedChat()?.id === chat.id) {
          chat.unreadCount = 0;
          this.chatService.markChatAsRead(chat.id).subscribe();
          this.messages.value.update((msgs) => [...msgs, message]);
        }
        this.startChat(chat);
      });
  }

  litenMessageRead() {
    this.chatService
      .listenMessageRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chatId) => {
        this.chats.update((chats) => {
          const index = chats.findIndex((chat) => chat.id === chatId);
          if (index === -1) return chats;
          if (chats[index].lastMessage) {
            chats[index].lastMessage.isRead = true;
          }
          return [...chats];
        });
        if (this.selectedChat() && this.selectedChat()?.id === chatId) {
          this.messages.update((msgs) =>
            msgs.map((item) => ({ ...item, isRead: true }))
          );
        }
      });
  }

  startChat(chat: Chat): void {
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
