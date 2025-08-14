import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { map, tap } from 'rxjs';
import { ChatMapper, ChatResponse } from '../../infrastructure';

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

  searchUser(term: string) {
    return this.http.get<user[]>(`${this.URL}/users/${term}`).pipe(
      map((resp) =>
        resp.map((item) => ({
          name: item.fullname,
          type: 'user',
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

  getMessages(chatId: string) {
    return this.http.get<any[]>(`${this.URL}/messages/${chatId}`);
  }
}
