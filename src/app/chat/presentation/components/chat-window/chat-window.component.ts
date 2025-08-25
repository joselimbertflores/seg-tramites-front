import {
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
  Component,
  viewChild,
  inject,
  signal,
  output,
  model,
} from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ChatBubbleComponent } from '../chat-bubble/chat-bubble.component';
import { Chat, Message } from '../../../domain';
import { ChatService } from '../../services';

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
export class ChatWindowComponent implements AfterViewInit {
  private chatService = inject(ChatService);

  selectedChat = model.required<Chat>();
  onSendMessage = output<Chat>();

  messageContent = signal<string>('');
  messages = model.required<Message[]>();
  chatIndex = model<number>(0);
  isLoading = signal<boolean>(false);

  scrollableDiv = viewChild.required<ElementRef<HTMLDivElement>>('chatPanel');

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

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

    this.chatIndex.update((i) => (i += 1));

    const prevHeight = this.scrollableDiv().nativeElement.scrollHeight;

    this.chatService
      .getChatMessages(this.selectedChat().id, this.chatIndex())
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
}
