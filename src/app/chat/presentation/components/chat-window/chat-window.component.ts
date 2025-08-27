import {
  ChangeDetectionStrategy,
  ElementRef,
  DestroyRef,
  Component,
  viewChild,
  inject,
  signal,
  output,
  model,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import {
  catchError,
  concatMap,
  EMPTY,
  finalize,
  forkJoin,
  from,
  switchMap,
  tap,
} from 'rxjs';

import { FileChatSelectorComponent } from '../file-chat-selector/file-chat-selector.component';
import { ChatBubbleComponent } from '../chat-bubble/chat-bubble.component';
import { ChatService } from '../../services';
import { Chat } from '../../../domain';

@Component({
  selector: 'chat-window',
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    ChatBubbleComponent,
    FileChatSelectorComponent,
    InfiniteScrollDirective,
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

  messages = rxResource({
    params: () => ({ chatId: this.chat().id }),
    stream: ({ params: { chatId } }) => {
      return this.chatService
        .getChatMessages(chatId)
        .pipe(finalize(() => this.scrollToBottom()));
    },
    defaultValue: [],
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
        type: 'text',
      })
      .subscribe(({ chat, message }) => {
        this.messageContent.set('');
        this.messages.update((msgs) => [...msgs, message]);
        this.onSendMessage.emit(chat);
        this.scrollToBottom();
      });
  }

  sendFiles(files: File[]):void {
    from(files)
      .pipe(
        concatMap((file) =>
          this.chatService.uploadFile(file).pipe(
            switchMap((media) =>
              this.chatService.sendMessage({
                chatId: this.chat().id,
                type: 'media',
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
    if (this.isLoading()) return;

    this.isLoading.set(true);

    this.chatIndex.update((i) => (i += 1));

    const prevHeight = this.scrollableDiv().nativeElement.scrollHeight;

    this.chatService
      .getChatMessages(this.chat().id, this.chatIndex())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((messages) => {
        if (messages.length === 0) return;
        this.messages.update((values) => [...messages, ...values]);
        this.restoreScrollPosition(prevHeight);
      });
  }

  private listenMessages() {
    this.chatService
      .listenMessages()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ message }) => {
        this.messages.update((msgs) => [...msgs, message]);
      });
  }

  private litenMessageRead() {
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
