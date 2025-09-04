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
  computed,
  input,
  OnChanges,
  SimpleChanges,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
  catchError,
  concatMap,
  EMPTY,
  finalize,
  from,
  Observable,
  switchMap,
} from 'rxjs';

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

  chat = input.required<Chat>();
  onSendMessage = output<Chat>();

  messageContent = signal<string>('');
  chatIndex = model<number>(0);

  scrollableDiv = viewChild.required<ElementRef<HTMLDivElement>>('chatPanel');

  isAtBottom = signal(true);
  newMessagesCount = signal(0);

  readonly isLoadingMoreMessages = signal<boolean>(false);

  // readonly messagesResource = rxResource({
  //   params: () => ({ chatId: this.chat().id }),
  //   stream: ({ params: { chatId } }) => {
  //     return this.chatService
  //       .getChatMessages(chatId)
  //       .pipe(finalize(() => this.scrollToBottom()));
  //   },
  // });

  // messages$: Observable<Message[]>=;i

  // messages = linkedSignal<Message[]>(() => {
  //   if (!this.messagesResource.hasValue()) return [];
  //   return this.messagesResource.value();
  // });
  messages$: Observable<Message[]>;
  previusHeigh = 0;

  files = signal<File[]>([]);

  readonly messagesResource = rxResource({
    params: () => ({ chatId: this.chat().id }),
    stream: ({ params: { chatId } }) => {
      return this.chatService.getMessages$(chatId);
    },
  });

  constructor() {
    effect(() => {
      this.chatService.resetChatView(this.chat().id);
    });
  }

  ngOnInit() {
    // this.chatService.getChatMessages(this.chat().id).subscribe();
    this.listenForNewMessages();
    this.listenForChatSeen();

    // Suscribirse a acciones de scroll
    this.chatService.getScrollAction$().subscribe((mode) => {
      if (mode === 'bottom') {
        this.scrollToBottom();
      } else if (mode === 'restore') {
        this.restoreScrollPosition();
      }
    });
  }

  sendMessage(): void {
    this.chatService
      .sendMessage({
        chatId: this.chat().id,
        content: this.messageContent(),
      })
      .subscribe(({ chat, message }) => {
        this.messageContent.set('');
        // this.messages.update((msgs) => [...msgs, message]);
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
        // this.messages.update((msgs) => [...msgs, message]);
        this.onSendMessage.emit(chat);
      });
  }

  onScrollUp() {
    this.previusHeigh = this.scrollableDiv().nativeElement.scrollHeight;
    this.chatService.loadMessages(this.chat().id, "restore");
    // if (this.isLoadingMoreMessages()) return;
    // this.isLoadingMoreMessages.set(true);
    // // this.chatIndex.update((i) => (i += 1));
    // // this.chatService.loadMore(this.chatId).subscribe();
    // this.chatService
    //   .getChatMessages(this.chat().id)
    //   .pipe(finalize(() => this.isLoadingMoreMessages.set(false)))
    //   .subscribe((messages) => {
    //     if (messages.length > 0) {
    //       // this.messages.update((values) => [...messages, ...values]);
    //       this.restoreScrollPosition(prevHeight);
    //     }
    //   });
    // this.chatService.loadMore(this.chat().id).subscribe();
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

  private listenForNewMessages(): void {
    this.chatService
      .listenForNewMessages()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ chat, message }) => {
        if (chat.id === this.chat().id) {
          // this.messages.update((msgs) => [...msgs, message]);
          this.setMessageToSeen();
          if (this.isAtBottom()) {
            this.scrollToBottom();
          } else {
            this.newMessagesCount.update((count) => count + 1);
          }
        }
      });
  }

  private listenForChatSeen(): void {
    this.chatService
      .listenForChatSeen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((chatId) => {
        if (chatId === this.chat().id) {
          // this.messages.update((msgs) =>
          //   msgs.map((item) => ({ ...item, isRead: true }))
          // );
        }
      });
  }

  private restoreScrollPosition(): void {
    setTimeout(() => {
      const container = this.scrollableDiv().nativeElement;
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - this.previusHeigh;
    });
  }

  private setMessageToSeen(): void {
    this.chatService.markChatAsRead(this.chat().id).subscribe(() => {
      // this.messages.update((msgs) =>
      //   msgs.map((item) => ({ ...item, isRead: true }))
      // );
      // this.chat.update((chat) => chat.copyWith({ unreadCount: 0 }));
    });
  }
}
