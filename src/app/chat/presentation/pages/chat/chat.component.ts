import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';

import { ChatListComponent, ChatBubbleComponent } from '../../components';
import { InfiniteScrollWrapperComponent } from '../../../../shared';
import { ChatService } from '../../services/chat.service';
import { Chat, Message } from '../../../domain';

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatInputModule,
    ChatListComponent,
    ChatBubbleComponent,
    InfiniteScrollWrapperComponent,
  ],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent {
  private chatService = inject(ChatService);
  chats = signal<Chat[]>([]);
  messages = signal<Message[]>([]);
  selectedChat = signal<Chat | null>(null);
  messageContent = signal<string>('');
  index = signal<number>(0);
  scrollableDiv = viewChild<ElementRef<HTMLDivElement>>('scrollableDiv');
  isChatLoading = signal<boolean>(false);

  ngOnInit() {
    this.getChatsByUser();
  }

  getChatsByUser() {
    this.chatService.getChatsByUser().subscribe((chats) => {
      this.chats.set(chats);
    });
  }

  loadMoreMessages() {
    // if (!this.selectedChat()) return;
    // console.log('get more messages from backend');
    // const prevScrollHeight =
    //   this.scrollableDiv()?.nativeElement.scrollHeight || 0;
    // this.chatService
    //   .getChatMessages(this.selectedChat()!.id, this.index())
    //   .pipe(finalize(() => this.isChatLoading.set(false)))
    //   .subscribe((messages) => {
    //     this.messages.update((values) => [...messages.reverse(), ...values]);

    //     setTimeout(() => {
    //       const newScrollHeight =
    //         this.scrollableDiv()?.nativeElement.scrollHeight ?? 0;
    //       // 4️⃣ Ajustamos scrollTop para mantener la posición
    //       this.scrollableDiv()!.nativeElement.scrollTop =
    //         newScrollHeight - prevScrollHeight;
    //     }, 0);
    //   });
  }

  selectChat(chat: Chat) {
    this.index.set(0);
    this.selectedChat.set(chat);
    this.chatService
    .getChatMessages(chat.id, this.index())
    .subscribe((messages) => {
      this.messages.set(messages.reverse());
      console.log("gettting data");
      setTimeout(() => this.scrollToBottom());
      });
  }

  sendMessage() {
    if (!this.selectedChat() || !this.messageContent()) return;

    this.chatService
      .sendMessage(this.selectedChat()!.id, this.messageContent())
      .subscribe(({ chat, message }) => {
        this.messageContent.set('');
        this.messages.update((msgs) => [...msgs, message]);
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
        setTimeout(() => this.scrollToBottom());
      });
  }

  onScrollUp() {
    if (this.isChatLoading()) return;
    this.isChatLoading.set(true);

    const prevScrollHeight =
      this.scrollableDiv()?.nativeElement.scrollHeight || 0;
    this.index.update((i) => (i += 1));
    this.loadMoreMessages();
  }

  private scrollToBottom() {
    if (!this.scrollableDiv()) return;
    const container = this.scrollableDiv()!.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
}
