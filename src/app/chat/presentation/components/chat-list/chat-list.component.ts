import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
  model,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';

import { MessageStatusComponent } from '../message-status/message-status.component';
import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { SearchInputComponent } from '../../../../shared';
import { Chat, IContact } from '../../../domain';
import { ChatService } from '../../services';

@Component({
  selector: 'chat-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    SearchInputComponent,
    MessageStatusComponent,
  ],
  templateUrl: './chat-list.component.html',
  styles: `
    .selected-chat {
      background: var(--mat-sys-surface-container-highest);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  private chatService = inject(ChatService);
  userId = inject(AuthService).user()?.userId;

  chats = model.required<Chat[]>();
  selectedChat = input.required<Chat | null>();
  onSelectChat = output<Chat>();

  term = signal<string>('');

  contacts = rxResource({
    params: () => ({ term: this.term() }),
    stream: ({ params }) => {
      if (!params.term.trim()) return of([]);
      return this.chatService.searchContact(params.term);
    },
  });

  selectContact(contact: IContact) {
    this.chatService.findOrCreateChat(contact.id).subscribe((chat) => {
      this.onSelectChat.emit(chat);
    });
  }

  selectChat(chat: Chat) {
    this.onSelectChat.emit(chat);
  }
}
