import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { ChatSidenavComponent } from '../../components';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../../domain';

@Component({
  selector: 'app-chat',
  imports: [RouterModule, ChatSidenavComponent],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent {
  private chatService = inject(ChatService);
  chats = signal<Chat[]>([]);

  ngOnInit() {
    this.chatService.getChatsByUser().subscribe((chats) => {
      this.chats.set(chats);
    });
  }
}
