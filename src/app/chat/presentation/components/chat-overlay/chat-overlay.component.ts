import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize, tap } from 'rxjs';

import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ChatOverlayService, ChatService } from '../../services';
import { overlayAnimation } from '../../../../shared';
import { Chat, Message } from '../../../domain';

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
  private chatOverlayService = inject(ChatOverlayService);

  constructor(@Inject('CHAT_DATA') public data: ChatOverlayData) {}

  ngOnInit(): void {
    this.chatService
      .getAccountChat(this.data.account)
      .pipe(
        tap((chat) => this.chat.set(chat)),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe();
  }

  close() {
    this.chatOverlayService.closeAccountChat();
  }
}
