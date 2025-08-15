import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';

import { ChatService } from '../../services/chat.service';
import { ChatBubbleComponent } from '..';
import { Chat } from '../../../domain';

@Component({
  selector: 'chat-window',
  imports: [CommonModule, ChatBubbleComponent],
  templateUrl: './chat-window.component.html',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindowComponent {
  private chatService = inject(ChatService);

  chat = input.required<Chat>();
  query = toSignal(
    inject(ActivatedRoute).params.pipe(
      map((params) => ({ type: params['type'], id: params['id'] }))
    )
  );

  chatInfo = signal<null | any>(null);
  messages = signal<any[]>([]);

  constructor() {
    effect(() => {
      console.log(this.chat());
      // if (this.query()?.type === 'user') {
      //   this.chatService.getChatByUser(this.query()?.id!).subscribe((data) => {
      //     this.chatInfo.set(data);
      //   });
      // } else {
      //   this.chatService.getMessages(this.query()?.id).subscribe((messages) => {
      //     console.log(messages);
      //     this.messages.set(messages);
      //   });
      // }
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
