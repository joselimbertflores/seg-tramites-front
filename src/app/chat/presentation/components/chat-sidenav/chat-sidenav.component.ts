import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  debounce,
  debounceTime,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  switchMap,
} from 'rxjs';

import { ChatListComponent } from '../chat-list/chat-list.component';
import { ChatService } from '../../services/chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Chat } from '../../../domain';

@Component({
  selector: 'chat-sidenav',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ChatListComponent,
  ],
  templateUrl: './chat-sidenav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatSidenavComponent {
  private destroyRef = inject(DestroyRef);
  private chatService = inject(ChatService);
  // chats = [
  //   { name: 'User 2', date: new Date(), message: 'Hola...' },
  //   { name: 'User 1', date: new Date(), message: 'Hola...' },
  //   { name: 'User 3', date: new Date(), message: 'Hola...', chatId: '232323' },
  // ];

  control = new FormControl('');

  term = signal<string>('');

  chats = input.required<Chat[]>();

  items = signal<any[]>([]);

  ngOnInit() {
    // this.control.valueChanges
    //   .pipe(
    //     filter((term) => !!term),
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     switchMap((term) => this.chatService.searchUser(term!)),
    //     takeUntilDestroyed(this.destroyRef)
    //   )
    //   .subscribe((users) => {
    //     this.items.set(users);
    //   });
  }
}
