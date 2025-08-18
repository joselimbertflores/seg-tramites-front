import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { ChatService } from '../../services/chat.service';
import { ChatListComponent, ChatBubbleComponent } from '../../components';

import { Chat, Message } from '../../../domain';

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatInputModule,
    ChatListComponent,
    ChatBubbleComponent,
  ],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent {
  private chatService = inject(ChatService);
  chats = signal<Chat[]>([]);
  messages = signal<Message[]>([]);

  selectedChat = signal<Chat | null>(null);
  messageContent = signal<string>('');

  ngOnInit() {
    this.getChatsByUser();
  }

  selectChat(chat: Chat) {
    this.selectedChat.set(chat);
    this.chatService.getChatMessages(chat.id).subscribe((messages) => {
      this.messages.set(messages);
    });
  }

  getChatsByUser() {
    this.chatService.getChatsByUser().subscribe((chats) => {
      this.chats.set(chats);
    });
  }

  sendMessage() {
    if (!this.selectedChat() || !this.messageContent()) return;
    this.chatService
      .sendMessage(this.selectedChat()!.id, this.messageContent())
      .subscribe((message) => {
        this.messageContent.set('');
        this.messages.update((values) => [...values, message]);
        this.chats.update((values) => {
          const index = values.findIndex( ({ id }) => id === this.selectedChat()!.id);
          values[index] = values[index].withNewMessage({
            sender: message.sender.id,
            sentAt: message.sentAt,
            content: message.content,
          });
          return [...values];
        });
      });
  }
}
