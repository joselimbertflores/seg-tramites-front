import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize, firstValueFrom, map } from 'rxjs';

import { ChatService } from '../../services/chat.service';
import { ChatBubbleComponent } from '..';
import { Chat, Message } from '../../../domain';
import { MatInputModule } from '@angular/material/input';
import { InfiniteScrollWrapperComponent } from '../../../../shared';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'chat-window',
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    ChatBubbleComponent,
    InfiniteScrollWrapperComponent,
  ],
  templateUrl: './chat-window.component.html',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowComponent {
  private chatService = inject(ChatService);

  selectedChat = input.required<Chat>();
  messageContent = signal<string>('');
  index = signal<number>(0);
  isChatLoading = signal<boolean>(false);


  messages = resource({
    params: () => ({ chatId: this.selectedChat().id, index: this.index() }),
    loader: ({ params: { index, chatId } }) =>
      firstValueFrom(this.chatService.getChatMessages(chatId, index)),
  });

  sendMessage() {
    if (!this.selectedChat() || !this.messageContent()) return;

    // this.chatService
    //   .sendMessage(this.selectedChat()!.id, this.messageContent())
    //   .subscribe(({ chat, message }) => {
    //     this.messageContent.set('');
    //     this.messages.update((msgs) => [...msgs, message]);
    //     this.chats.update((chats) => {
    //       const index = chats.findIndex((item) => item.id === chat.id);
    //       if (index === -1) {
    //         chats.unshift(chat);
    //       } else {
    //         chats[index] = chat;
    //       }
    //       return [...chats].sort(
    //         (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
    //       );
    //     });
    //   });
  }

  onScrollUp() {
    if (this.messages.isLoading()) return;
    this.isChatLoading.set(true);
    this.chatService
      .getChatMessages(this.selectedChat().id, this.index() + 1)
      .pipe(finalize(() => this.isChatLoading.set(false)))
      .subscribe((newMessages) => {
        this.messages.update((values) => [...newMessages, ...(values ?? [])]);
      });
  }
}
