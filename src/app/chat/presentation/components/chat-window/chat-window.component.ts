import {
  ChangeDetectionStrategy,
  linkedSignal,
  ElementRef,
  Component,
  viewChild,
  inject,
  model,
  signal,
  output,
} from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatInputModule } from '@angular/material/input';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, map } from 'rxjs';

import { ChatBubbleComponent } from '../chat-bubble/chat-bubble.component';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../domain';
import { SocketService } from '../../../../layout/presentation/services';

@Component({
  selector: 'chat-window',
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    ChatBubbleComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './chat-window.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowComponent {
  private chatService = inject(ChatService);
  private socketService = inject(SocketService);

  selectedChat = model.required<Chat>();
  onSendMessage = output<Chat>();

  messageContent = signal<string>('');
  index = model<number>(0);
  isLoading = signal<boolean>(false);

  scrollableDiv = viewChild.required<ElementRef<HTMLDivElement>>('chatPanel');

  ngOnInit() {
    this.listenChats();
  }

  messagesRes = rxResource({
    params: () => ({ chatId: this.selectedChat().id }),
    stream: ({ params: { chatId } }) => {
      return this.chatService.getChatMessages(chatId).pipe(
        map((messages) => messages),
        finalize(() => this.scrollToBottom())
      );
    },
    defaultValue: [],
  });

  messages = linkedSignal({
    source: this.messagesRes.value,
    computation: (messages) => {
      if (this.messagesRes.isLoading()) return [];
      return messages;
    },
  });

  sendMessage() {
    this.chatService
      .sendMessage(this.selectedChat().id, this.messageContent())
      .subscribe(({ chat, message }) => {
        this.messageContent.set('');
        this.messages.update((msgs) => [...msgs, message]);
        this.onSendMessage.emit(chat);
        this.scrollToBottom();
      });
  }

  onScrollUp() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.index.update((i) => (i += 1));
    const prevHeight = this.scrollableDiv().nativeElement.scrollHeight;
    this.chatService
      .getChatMessages(this.selectedChat().id, this.index())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((messages) => {
        if (messages.length === 0) return;
        this.messages.update((values) => [...messages, ...values]);
        this.restoreScrollPosition(prevHeight);
      });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.scrollableDiv().nativeElement;
      container.scrollTop = container.scrollHeight;
    });
  }

  private restoreScrollPosition(prevHeight: number): void {
    setTimeout(() => {
      const container = this.scrollableDiv().nativeElement;
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - prevHeight;
    });
  }

  listenChats() {
    this.socketService.messages$.subscribe((data) => {
      console.log(data);
      this.messages.update((msgs) => [...msgs, data.message]);
      this.scrollToBottom();
    });
  }
}
