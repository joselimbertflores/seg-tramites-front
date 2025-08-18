import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

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
  private readonly URL = `${environment.base_url}/chat`;
  private http = inject(HttpClient);
  constructor() {}

  findOrCreateChat(receiverId: string) {
    return this.http
      .get<ChatResponse>(`${this.URL}/start/${receiverId}`)
      .pipe(map((resp) => ChatMapper.fromResponse(resp)));
  }

  searchContact(term: string) {
    return this.http.get<user[]>(`${this.URL}/users/${term}`).pipe(
      map((resp) =>
        resp.map((item) => ({
          fullname: item.fullname,
          id: item._id,
        }))
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

  getChatMessages(chatId: string) {
    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`)
      .pipe(
        map((resp) => resp.map((item) => MessageMapper.fromResponse(item)))
      );
  }

  sendMessage(chatId: string, content: string) {
    return this.http
      .post<MessageResponse>(
        `${this.URL}/${chatId}/messages`,
        {
          content,
        }
      )
      .pipe(
        tap((resp) => console.log(resp)),
        map((resp) => (MessageMapper.fromResponse(resp)))
      );
  }
}
