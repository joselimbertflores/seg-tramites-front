import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, finalize, Subject, share, map, tap } from 'rxjs';
import type { Socket } from 'socket.io-client';

import { SocketService } from '../../../layout/presentation/services';
import { environment } from '../../../../environments/environment';
import {
  ChatMapper,
  ChatResponse,
  MessageMapper,
  MessageResponse,
} from '../../infrastructure';
import { ActiveMessagesData, Message, ScrollType } from '../../domain';
import { user } from '../../../users/infrastructure';
interface ChatEventData {
  chat: ChatResponse;
  message: MessageResponse;
}
interface UploadedFile {
  fileName: string;
  originalName: string;
  type: string;
}
interface CreateMessageData {
  chatId: string;
  content?: string;
  media?: UploadedFile;
}
interface ChatCache {
  messages: Message[];
  page: number;
  hasMore: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private socketRef: Socket | null = null;
  private socketService = inject(SocketService);
  private readonly URL = `${environment.base_url}/chat`;

  private readonly LIMIT = 20;
  private caches = new Map<string, ChatCache>();
  private activeChatId: string | null = null;
  private activeMessagesData = new BehaviorSubject<ActiveMessagesData>({
    messages: [],
  });

  private _isLoading = signal(false);
  isLoading = computed(() => this._isLoading());

  private _chatSubject = new Subject<ChatEventData>();
  readonly listenMessages$ = this._chatSubject.asObservable().pipe(
    map(({ message, chat }) => ({
      chat: ChatMapper.fromResponse(chat),
      message: MessageMapper.fromResponse(message),
    })),
    tap(({ message }) => this.insertNewMessage(message, 'new')),
    share()
  );

  private _chatReadSubject = new Subject<string>();
  readonly listenReadMessages$ = this._chatReadSubject.asObservable().pipe(
    tap((chatId: string) => {
      const cache = this.caches.get(chatId);
      if (!cache) return;

      cache.messages = cache.messages.map((msgs) => ({
        ...msgs,
        isRead: true,
      }));

      if (chatId === this.activeChatId) {
        this.updateChatView(cache.messages);
      }
    }),
    share()
  );

  constructor() {}

  messages$() {
    return this.activeMessagesData.asObservable();
  }

  // * Execute after socket initialize
  initChatEvents(): void {
    this.socketRef = this.socketService.getSocket();
    if (!this.socketRef) return;

    this.socketRef.on('sendMessage', (data: ChatEventData) => {
      this._chatSubject.next(data);
    });

    this.socketRef.on('readMessage', (chatId: string) => {
      this._chatReadSubject.next(chatId);
    });
  }

  openChat(chatId: string): void {
    this.activeChatId = chatId;
    this.activeMessagesData.next({ messages: [] });
    this.loadMessages(chatId);
  }

  loadOlderMessages(): void {
    if (!this.activeChatId || this._isLoading()) return;
    this.loadMessages(this.activeChatId);
  }

  private loadMessages(chatId: string): void {
    const cache = this.ensureCache(chatId);

    const currentCount = this.activeMessagesData.value.messages.length;

    const scrollType = currentCount === 0 ? 'init' : 'scroll';

    if (currentCount < cache.messages.length) {
      this.updateChatView(cache.messages, scrollType);
      return;
    }

    if (!cache.hasMore) return;

    this.fetchBackend(chatId, cache.page).subscribe((msgs) => {
      cache.messages = [...msgs, ...cache.messages];
      cache.page += 1;
      cache.hasMore = msgs.length === this.LIMIT;
      this.updateChatView(cache.messages, scrollType);
    });
  }

  private fetchBackend(chatId: string, page: number) {
    this._isLoading.set(true);
    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`, {
        params: { offset: page * this.LIMIT, limit: this.LIMIT },
      })
      .pipe(
        map((resp) => resp.map(MessageMapper.fromResponse)),
        finalize(() => this._isLoading.set(false))
      );
  }

  private updateChatView(messages: Message[], scroll?: ScrollType): void {
    const currentCount = this.activeMessagesData.value.messages.length;
    const pages = Math.ceil(currentCount / this.LIMIT) + 1;

    const toTake = this.LIMIT * pages;
    this.activeMessagesData.next({
      messages: messages.slice(-toTake),
      scroll: scroll,
    });
  }

  private ensureCache(chatId: string): ChatCache {
    if (!this.caches.has(chatId)) {
      this.caches.set(chatId, { messages: [], page: 0, hasMore: true });
    }
    return this.caches.get(chatId)!;
  }

  private insertNewMessage(msg: Message, scroll?: ScrollType): void {
    const cache = this.ensureCache(msg.chat);
    cache.messages.push(msg);

    if (this.activeChatId === msg.chat) {
      this.updateChatView(cache.messages, scroll);
    }
  }

  findOrCreateChat(receiverId: string) {
    return this.http
      .get<ChatResponse>(`${this.URL}/start/${receiverId}`)
      .pipe(map((resp) => ChatMapper.fromResponse(resp)));
  }

  getChats() {
    return this.http
      .get<ChatResponse[]>(this.URL)
      .pipe(map((resp) => resp.map(ChatMapper.fromResponse)));
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

  markChatAsRead(chatId: string) {
    return this.http.patch<{ message: string }>(
      `${this.URL}/${chatId}/read`,
      {}
    );
  }

  sendMessage({ chatId, content, media }: CreateMessageData) {
    const data = media
      ? { type: media.type, media }
      : { type: 'text', content };

    return this.http
      .post<{ chat: ChatResponse; message: MessageResponse }>(
        `${this.URL}/${chatId}/message`,
        data
      )
      .pipe(
        map(({ chat, message }) => ({
          message: MessageMapper.fromResponse(message),
          chat: ChatMapper.fromResponse(chat),
        })),
        tap(({ message }) => this.insertNewMessage(message, 'init'))
      );
  }
}
