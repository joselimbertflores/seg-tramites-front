import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

import { ChatService } from '../../services/chat.service';
import { ChatListComponent, ChatBubbleComponent } from '../../components';

import { Chat, Message } from '../../../domain';
import { FormsModule } from '@angular/forms';

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
    this.chatService.getChatsByUser().subscribe((chats) => {
      this.chats.set(chats);
      console.log(chats);
    });
  }

  selectChat(chat: Chat) {
    this.selectedChat.set(chat);
    this.chatService.getChatMessages(chat.id).subscribe((messages) => {
      console.log(messages);
      this.messages.set(messages);
    });
  }

  sendMessage() {
    if (!this.selectedChat() || !this.messageContent()) return;
    this.chatService
      .sendMessage(this.selectedChat()!.id, this.messageContent())
      .subscribe(() => {
        this.messageContent.set('');
      });
  }
}
