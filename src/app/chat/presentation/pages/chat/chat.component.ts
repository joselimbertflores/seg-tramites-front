import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatListComponent } from '../../components';

@Component({
  selector: 'app-chat',
  imports: [RouterModule, ChatListComponent],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent {
  chats = [
    { name: 'User 2', date: new Date(), message: 'Hola...' },
    { name: 'User 1', date: new Date(), message: 'Hola...' },
    { name: 'User 3', date: new Date(), message: 'Hola...', chatId: '232323' },
  ];
}
