import {
  ChangeDetectionStrategy,
  linkedSignal,
  ElementRef,
  DestroyRef,
  Component,
  viewChild,
  inject,
  signal,
  output,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { catchError, concatMap, EMPTY, finalize, from, switchMap } from 'rxjs';

import { FileChatSelectorComponent } from '../file-chat-selector/file-chat-selector.component';
import { ChatBubbleComponent } from '../chat-bubble/chat-bubble.component';
import { Chat, Message } from '../../../domain';
import { ChatService } from '../../services';

@Component({
  selector: 'chat-window',
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    InfiniteScrollDirective,
    ChatBubbleComponent,
    FileChatSelectorComponent,
  ],
  templateUrl: './chat-window.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowComponent {
  private chatService = inject(ChatService);
  private destroyRef = inject(DestroyRef);

  chat = model.required<Chat>();
  onSendMessage = output<Chat>();

  messageContent = signal<string>('');
  chatIndex = model<number>(0);
  isLoading = signal<boolean>(false);

  scrollableDiv = viewChild.required<ElementRef<HTMLDivElement>>('chatPanel');

  isAtBottom = signal(true);
  newMessagesCount = signal(0);

  private messagesResource = rxResource({
    params: () => ({ chatId: this.chat().id }),
    stream: ({ params: { chatId } }) =>
      this.chatService
        .getChatMessages(chatId)
        .pipe(finalize(() => this.scrollToBottom())),
  });

  messages = linkedSignal<Message[]>(() => {
    if (!this.messagesResource.hasValue()) return [];
    return this.messagesResource.value();
  });

  files = signal<File[]>([]);

  ngOnInit() {
    this.listenMessages();
    this.litenMessageRead();
  }

  sendMessage(): void {
    this.chatService
      .sendMessage({
        chatId: this.chat().id,
        content: this.messageContent(),
      })
      .subscribe(({ chat, message }) => {
        this.messageContent.set('');
        this.messages.update((msgs) => [...msgs, message]);
        this.onSendMessage.emit(chat);
        this.scrollToBottom();
      });
  }

  sendFiles(files: File[]): void {
    from(files)
      .pipe(
        concatMap((file) =>
          this.chatService.uploadFile(file).pipe(
            switchMap((media) =>
              this.chatService.sendMessage({
                chatId: this.chat().id,
                media,
              })
            ),
            catchError(() => EMPTY)
          )
        ),
        finalize(() => {
          this.messageContent.set('');
          this.scrollToBottom();
        })
      )
      .subscribe(({ chat, message }) => {
        this.messages.update((msgs) => [...msgs, message]);
        this.onSendMessage.emit(chat);
      });
  }

  onScrollUp() {
    const prevHeight = this.scrollableDiv().nativeElement.scrollHeight;
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.chatIndex.update((i) => (i += 1));
    this.chatService
      .getChatMessages(this.chat().id, this.chatIndex())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((messages) => {
        if (messages.length === 0) return;
        this.messages.update((values) => [...messages, ...values]);
        this.restoreScrollPosition(prevHeight);
      });
  }

  onScroll() {
    const el = this.scrollableDiv().nativeElement;
    const threshold = 100;
    const position = el.scrollTop + el.clientHeight;
    const height = el.scrollHeight;
    this.isAtBottom.set(position >= height - threshold);
    if (this.isAtBottom()) {
      this.newMessagesCount.set(0);
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.scrollableDiv().nativeElement;
      container.scrollTop = container.scrollHeight;
    });
  }

  private setMessageToSeen() {
    // if (this.chat().unreadCount > 0) {
    //   console.log('SETTING MESSAGES VIEW');
    //   this.chatService.markChatAsRead(this.chat().id).subscribe(() => {
    //     this.chat.update((chat) => chat.copyWith({ unreadCount: 0 }));
    //   });
    // }
  }

  private listenMessages(): void {
    this.chatService
      .listenMessages()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ chat, message }) => {
        if (chat.id === this.chat().id) {
          // this.onSendMessage.emit(chat);
          this.messages.update((msgs) => [...msgs, message]);
          this.readMessages();
          if (this.isAtBottom()) {
            this.scrollToBottom();
          } else {
            this.newMessagesCount.update((count) => count + 1);
          }
        }
      });
  }

  private litenMessageRead(): void {
    this.chatService
      .listenMessageRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chatId) => {
        if (chatId === this.chat().id) {
          this.messages.update((msgs) =>
            msgs.map((item) => ({ ...item, isRead: true }))
          );
        }
      });
  }

  private restoreScrollPosition(prevHeight: number): void {
    setTimeout(() => {
      const container = this.scrollableDiv().nativeElement;
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - prevHeight;
    });
  }

  private readMessages(): void {
    this.chatService.markChatAsRead(this.chat().id).subscribe(() => {
      this.messages.update((msgs) =>
        msgs.map((item) => ({ ...item, isRead: true }))
      );
    });
  }
}
