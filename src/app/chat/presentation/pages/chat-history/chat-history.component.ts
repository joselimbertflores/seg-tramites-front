import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { BubleChatComponent } from '../../components';

@Component({
  selector: 'app-chat-history',
  imports: [BubleChatComponent],
  templateUrl: './chat-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatHistoryComponent {
  private chatService = inject(ChatService);
  query = toSignal(
    inject(ActivatedRoute).params.pipe(
      map((params) => ({ type: params['type'], id: params['id'] }))
    )
  );

  chatInfo = signal<null | any>(null);
  messages = signal<any[]>([]);

  constructor() {
    effect(() => {
      if (this.query()?.type === 'user') {
        this.chatService.getChatByUser(this.query()?.id!).subscribe((data) => {
          this.chatInfo.set(data);
        });
      } else {
        this.chatService.getMessages(this.query()?.id).subscribe((messages) => {
          console.log(messages);
          this.messages.set(messages);
        });
      }
    });
  }

  senMessage() {
    this.chatService
      .createMessage({
        chatId: null,
        content: 'Probando el envio de mensajes',
        receiverId: this.query()?.id,
      })
      .subscribe((data) => {
        console.log(data);
      });
  }
}
