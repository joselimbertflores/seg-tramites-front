import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ChatMapper,
  ChatResponse,
  MessageMapper,
  MessageResponse,
} from '../../infrastructure';
import { SocketService } from '../../../layout/presentation/services';

interface user {
  _id: string;
  fullname: string;
}
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly URL = `${environment.base_url}/chat`;
  private http = inject(HttpClient);
  private onlineUsers = inject(SocketService).currentOnlineUsers;
  constructor() {}

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

  getChatsByUser() {
    return this.http
      .get<ChatResponse[]>(`${this.URL}/my`)
      .pipe(map((resp) => resp.map((item) => ChatMapper.fromResponse(item))));
  }

  getChatByUser(id: string) {
    return this.http.get<user[]>(`${this.URL}/user/${id}`);
  }

  createMessage(data: { chatId: null; content: string; receiverId: string }) {
    return this.http.post<user[]>(`${this.URL}`, data);
  }

  getChatMessages(chatId: string, index: number) {
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
}
