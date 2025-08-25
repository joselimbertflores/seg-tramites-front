import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of, Subject, tap } from 'rxjs';
import type { Socket } from 'socket.io-client';

import { SocketService } from '../../../layout/presentation/services';
import { environment } from '../../../../environments/environment';
import {
  ChatMapper,
  ChatResponse,
  MessageMapper,
  MessageResponse,
} from '../../infrastructure';
import { Message } from '../../domain';

interface user {
  _id: string;
  fullname: string;
}

interface ChatEventData {
  chat: ChatResponse;
  message: MessageResponse;
}
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private readonly URL = `${environment.base_url}/chat`;
  private socketRef: Socket | null = null;

  private chatSubject$ = new Subject<ChatEventData>();
  private messageCache: Record<string, Message[]> = {};

  constructor() {
    this.startSocketConfig();
  }

  findOrCreateChat(receiverId: string) {
    return this.http
      .get<ChatResponse>(`${this.URL}/start/${receiverId}`)
      .pipe(map((resp) => ChatMapper.fromResponse(resp)));
  }

  getAccountChat(accountId: string) {
    return this.http
      .get<ChatResponse>(`${this.URL}/account/${accountId}`)
      .pipe(map((resp) => ChatMapper.fromResponse(resp)));
  }

  searchContact(term: string) {
    return this.http.get<user[]>(`${this.URL}/users/${term}`).pipe(
      map((resp) =>
        resp.map((contact) => {
          const isOnline = this.socketService.currentOnlineUsers.some(
            ({ userId }) => contact._id === userId
          );
          return {
            id: contact._id,
            fullname: contact.fullname,
            isOnline,
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
    const key = `${chatId}-${index}`;

    if (this.messageCache[key]) return of(this.messageCache[key]);

    const params = new HttpParams({
      fromObject: { limit: 20, offset: index * 20 },
    });
    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`, { params })
      .pipe(
        map((resp) => resp.map((item) => MessageMapper.fromResponse(item))),
        tap((messages) => {
          if (messages.length > 0) {
            this.messageCache[key] = messages;
          }
        })
      );
  }

  sendMessage(chatId: string, content: string) {
    return this.http
      .post<{ chat: ChatResponse; message: MessageResponse }>(
        `${this.URL}/${chatId}/message`,
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

  listenMessages() {
    return this.chatSubject$.asObservable().pipe(
      map((data) => {
        const chat = ChatMapper.fromResponse(data.chat);
        const message = MessageMapper.fromResponse(data.message);
        return { chat, message };
      })
    );
  }

  listenMessageRead(): Observable<string> {
    return new Observable((observable) => {
      this.socketRef?.on('readMessage', (chatId: string) => {
        observable.next(chatId);
      });
    });
  }

  private startSocketConfig(): void {
    // * Get socket reference
    this.socketRef = this.socketService.getSocket();

    //  * Start listen event
    this.socketRef?.on('sendMessage', (data: ChatEventData) => {
      this.chatSubject$.next(data);
    });
  }
}
