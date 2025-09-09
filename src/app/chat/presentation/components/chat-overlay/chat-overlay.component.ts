import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  signal,
} from '@angular/core';
import { ChatService } from '../../services';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { Chat, Message } from '../../../domain';
import { finalize, switchMap, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { overlayAnimation } from '../../../../shared';

interface ChatOverlayData {
  account: string;
}
@Component({
  selector: 'app-chat-overlay',
  imports: [MatButtonModule, MatIconModule, ChatWindowComponent],
  template: `
    <div class="overlay sm:w-[600px]" @overlayAnimation>
      <div class="flex items-center justify-between w-full px-4 py-2">
        <div class="text-lg font-medium">Chat</div>
        <div>
          <button mat-icon-button (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      <div class="h-[600px]">
        @if(chat() && !isLoading()){
        <chat-window [chat]="chat()!" />
        }
      </div>
    </div>
  `,
  animations: [overlayAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatOverlayComponent {
  messages = signal<Message[]>([]);
  chat = signal<Chat | null>(null);
  isLoading = signal<boolean>(true);

  private chatService = inject(ChatService);

  constructor(@Inject('CHAT_DATA') public data: ChatOverlayData) {}

  ngOnInit(): void {
    this.chatService
      .getAccountChat(this.data.account)
      .pipe(
        tap((chat) => this.chat.set(chat)),
        // switchMap((chat) => this.chatService.getChatMessages(chat.id)),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((messages) => {
        // this.messages.set(messages);
      });
  }

  close() {
    // this.chatService.closeAccountChat();
  }
}
