import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { ChatService } from '../../services/chat.service';
import { SearchInputComponent } from '../../../../shared';
import { Chat, IContact } from '../../../domain';

@Component({
  selector: 'chat-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    SearchInputComponent,
  ],
  template: `
    <div class="w-full flex flex-col h-full">

      <div class="flex flex-row justify-between items-center" >
        <p class="p-3 text-2xl font-medium">Mensajes</p>
      </div>

      <div class="py-3 px-2">
        <div class="h-[48px]">
          <search-input (onSearch)="searchContact($event)" [clearable]="true" title="Buscar contacto" placeholder="Nombre del usuario" />
        </div>
      </div>
      

      <!-- Contacts -->
      <div class="flex-1 overflow-auto p-2">
        @if(searchNewContact()){ @for (item of contacts(); track $index) {
        <div
          class="px-3 flex items-center cursor-pointer"
          (click)="selectContact(item)"
        >
          <div class="relative">
            <img class="h-10 w-10 rounded-full" src="images/avatar.png" />
          </div>
          <div class="ml-4 flex-1 py-4 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-grey-darkest font-medium truncate">
                {{ item.fullname | titlecase }}
              </p>
            </div>
            <div class="text-sm">{{item.isOnline?"En linea":"Sin conexion"}}</div>
          </div>
        </div>
        } 
      } 
        @else { 
          @for (item of chats(); track $index) {
            <div
              class="px-3 flex items-center cursor-pointer rounded-xl hover:bg-[var(--mat-sys-surface-container)]"
              (click)="selectChat(item)"
              [class.selected-chat]="item.id === selectedChat()?.id"
            >
              <div class="relative">
                <img
                  class="h-10 w-10 rounded-full"
                  src="images/avatar.png"
                  alt="avatar"
                />
              </div>

              <div class="ml-4 flex-1 py-4 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-grey-darkest font-medium truncate">
                    {{ item.name | titlecase }}
                  </p>
                  <p class="text-xs text-grey-darkest whitespace-nowrap">
                    {{ item.sentAt | date }}
                  </p>
                </div>

                <div class="flex items-center justify-between mt-1">
                  <p class="text-grey-dark text-sm truncate max-w-[85%]">
                    {{ item.lastMessage?.content }}
                  </p>

                  @if (item.unreadCount > 0) {
                    <span
                      class="ml-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                    >
                      {{ item.unreadCount }}
                    </span>
                  }
                </div>
              </div>
            </div>
          } 
          @empty {
            <div class="text-center p-3">Usted aun no tiene conversaciones</div>
          }
      }
      </div>
    </div>
  `,
  styles: `
    .selected-chat {
      background: var(--mat-sys-surface-container-highest);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  private chatService = inject(ChatService);

  chats = model.required<Chat[]>();
  onChatSelect = output<Chat>();
  selectedChat = signal<Chat | null>(null);

  contacts = signal<IContact[]>([]);
  searchNewContact = signal(false);
  

  ngOnInit() {}

  searchContact(term: string) {
    if (!term) {
      this.searchNewContact.set(false);
      return;
    }
    this.chatService.searchContact(term).subscribe((contacts) => {
      this.searchNewContact.set(true);
      this.contacts.set(contacts);
    });
  }

  selectContact(contact: IContact) {
    this.chatService.findOrCreateChat(contact.id).subscribe((chat) => {
      this.onChatSelect.emit(chat);
    });
  }

  selectChat(chat: Chat) {
    this.selectedChat.set(chat);
    this.onChatSelect.emit(chat);
  }
}
