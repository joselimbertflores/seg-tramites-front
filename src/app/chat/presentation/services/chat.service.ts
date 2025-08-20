import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

import { SocketService } from '../../../layout/presentation/services';
import { environment } from '../../../../environments/environment';
import {
  ChatMapper,
  ChatResponse,
  MessageMapper,
  MessageResponse,
} from '../../infrastructure';

interface user {
  _id: string;
  fullname: string;
}
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private readonly URL = `${environment.base_url}/chat`;
  private onlineUsers = inject(SocketService).currentOnlineUsers;

  findOrCreateChat(receiverId: string) {
    return this.http
      .get<ChatResponse>(`${this.URL}/start/${receiverId}`)
      .pipe(map((resp) => ChatMapper.fromResponse(resp)));
  }

  searchContact(term: string) {
    return this.http.get<user[]>(`${this.URL}/users/${term}`).pipe(
      map((resp) =>
        resp.map((contact) => {
          const isOnline = this.onlineUsers.find(
            ({ userId }) => contact._id === userId
          );
          return {
            id: contact._id,
            fullname: contact.fullname,
            isOnline: isOnline ? true : false,
          };
        })
      )
    );
  }

  geChats() {
    return this.http
      .get<ChatResponse[]>(this.URL)
      .pipe(map((resp) => resp.map((item) => ChatMapper.fromResponse(item))));
  }

  getChatMessages(chatId: string, index: number = 0) {
    const params = new HttpParams({
      fromObject: { limit: 20, offset: index * 20 },
    });
    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`, { params })
      .pipe(
        map((resp) => resp.map((item) => MessageMapper.fromResponse(item)))
      );
  }

  sendMessage(chatId: string, content: string) {
    return this.http
      .post<{ chat: ChatResponse; message: MessageResponse }>(
        `${this.URL}/${chatId}/messages`,
        { content }
      )
      .pipe(
        map(({ chat, message }) => ({
          message: MessageMapper.fromResponse(message),
          chat: ChatMapper.fromResponse(chat),
        }))
      );
  }

  markChatAsRead(chatId: string) {
    return this.http.patch<{ message: string }>(
      `${this.URL}/${chatId}/read`,
      {}
    );
  }
}
