import {
  ChangeDetectionStrategy,
  ElementRef,
  DestroyRef,
  Component,
  viewChild,
  inject,
  signal,
  output,
  input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { catchError, concatMap, EMPTY, finalize, from, switchMap } from 'rxjs';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { FileChatSelectorComponent } from '../file-chat-selector/file-chat-selector.component';
import { ChatBubbleComponent } from '../chat-bubble/chat-bubble.component';
import { FileUploadService } from '../../../../shared';
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
export class ChatWindowComponent implements OnChanges {
  private destroyRef = inject(DestroyRef);
  private chatService = inject(ChatService);
  private fileUploadService = inject(FileUploadService);

  chat = input.required<Chat>();
  onSendMessage = output<Chat>();

  chatPanel = viewChild.required<ElementRef<HTMLDivElement>>('chatPanel');

  previusHeight = 0;
  isAtBottom = signal(true);
  newMessagesCount = signal(0);

  messageContent = signal<string>('');
  messages = signal<Message[]>([]);
  files = signal<File[]>([]);

  isLoading = this.chatService.isLoading;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat']) {
      this.chatService.openChat(this.chat().id);
    }
  }

  ngOnInit() {
    this.listenForNewMessages();
    this.listenForChatSeen();
    this.setMessagesConfig();
    if (this.chat().unreadCount > 0) {
      this.setMessageToSeen();
    }
    // this.closeChatOverlay();
  }

  sendMessage(): void {
    if (!this.messageContent()) return;
    this.chatService
      .sendMessage({
        chatId: this.chat().id,
        content: this.messageContent(),
      })
      .subscribe(({ chat }) => {
        this.messageContent.set('');
        this.onSendMessage.emit(chat);
      });
  }

  sendFiles(files: File[]): void {
    from(files)
      .pipe(
        concatMap((file) =>
          this.fileUploadService.uploadFile(file, 'chat').pipe(
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
      .subscribe(({ chat }) => {
        this.onSendMessage.emit(chat);
      });
  }

  scrollUp() {
    this.previusHeight = this.chatPanel().nativeElement.scrollHeight;
    this.chatService.loadMessages(this.chat().id);
  }

  scroll() {
    const element = this.chatPanel().nativeElement;
    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;
    this.isAtBottom.set(position >= height - 100);
    if (this.isAtBottom()) {
      this.newMessagesCount.set(0);
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.chatPanel().nativeElement;
      container.scrollTop = container.scrollHeight;
    });
  }

  restoreScroll(): void {
    setTimeout(() => {
      const container = this.chatPanel().nativeElement;
      container.scrollTop = container.scrollHeight - this.previusHeight;
      this.previusHeight = 0;
    });
  }

  private listenForChatSeen(): void {
    this.chatService.listenReadMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private listenForNewMessages(): void {
    this.chatService.listenMessages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isAtBottom()) {
          this.newMessagesCount.update((value) => (value += 1));
        }
        this.chatService.markChatAsRead(this.chat().id).subscribe();
      });
  }

  private setMessagesConfig() {
    this.chatService.messages$().subscribe(({ messages, scroll }) => {
      this.messages.set(messages);
      switch (scroll) {
        case 'init':
          this.scrollToBottom();
          break;
        case 'scroll':
          this.restoreScroll();
          break;
        case 'new':
          if (this.isAtBottom()) {
            this.scrollToBottom();
          }
          break;

        default:
          break;
      }
    });
  }

  private setMessageToSeen(): void {
    this.chatService.markChatAsRead(this.chat().id).subscribe();
  }
}
