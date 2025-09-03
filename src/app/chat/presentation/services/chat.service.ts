import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { map, Observable, of, share, Subject, tap } from 'rxjs';
import type { Socket } from 'socket.io-client';

import { SocketService } from '../../../layout/presentation/services';
import { environment } from '../../../../environments/environment';
import {
  ChatMapper,
  ChatResponse,
  MessageMapper,
  MessageResponse,
} from '../../infrastructure';
import { Chat, Message } from '../../domain';
import { ChatOverlayComponent } from '../components';

type MediaType = 'text' | 'image' | 'audio' | 'video' | 'document';
interface user {
  _id: string;
  fullname: string;
}

interface ChatEventData {
  chat: ChatResponse;
  message: MessageResponse;
}

interface UploadedFile {
  fileName: string;
  originalName: string;
  type: MediaType;
}

interface CreateMessageData {
  chatId: string;
  content?: string;
  media?: UploadedFile;
}

interface ChatCache {
  messages: Message[];
  hasMore: boolean; // para saber si quedan mensajes por pedir
  page: number; // cuántas páginas ya cargaste
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private overlay = inject(Overlay);
  private socketService = inject(SocketService);
  private readonly URL = `${environment.base_url}/chat`;
  private socketRef: Socket | null = null;

  // * Properties for chat panel
  private injector: Injector;
  private overlayRef: OverlayRef | null = null;

  private messagesCache: Record<string, Message[]> = {};
  private chatSubject$ = new Subject<ChatEventData>();
  private chatReadSubject$ = new Subject<string>();

  chatCache: Chat[] = [];

  private cache = new Map<string, ChatCache>();

  index = signal(0);
  offsete = computed(() => this.index() * 20);

  currentChat = signal<Chat | null>(null);
  messages = signal<Message[]>([]);

  constructor() {
    console.log('socket service star');
    this.socketRef = this.socketService.getSocket();
    if (this.socketRef) {
      this.socketRef.on('sendMessage', (data: ChatEventData) => {
        this.chatSubject$.next(data);
      });
      this.socketRef.on('readMessage', (chatId: string) => {
        this.chatReadSubject$.next(chatId);
      });
    }
  }

  geChats() {
    if (this.chatCache.length > 0) return of(this.chatCache);
    return this.http.get<ChatResponse[]>(this.URL).pipe(
      map((resp) => resp.map((item) => ChatMapper.fromResponse(item))),
      tap((chats) => {
        this.chatCache = chats;
      })
    );
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

  getChatMessages(chatId: string, index: number = 0) {
    const key = `${chatId}-${index}`;

    if (this.messagesCache[key]) return of([...this.messagesCache[key]]);

    const params = new HttpParams({
      fromObject: { limit: 20, offset: index * 20 },
    });
    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`, { params })
      .pipe(
        map((resp) => resp.map((item) => MessageMapper.fromResponse(item))),
        tap((messages) => {
          if (messages.length > 0) {
            this.messagesCache[key] = messages;
          }
        })
      );
  }

  loadMessages(chatId: string): Observable<void> {
    const itemCache = this.ensureChat(chatId);
    if (!itemCache.hasMore) return of(void 0);

    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`, {
        params: { limit: 20, offset: itemCache.page * 20 },
      })
      .pipe(
        map((resp) => resp.map((item) => MessageMapper.fromResponse(item))),
        tap((newMessages) => {
          if (newMessages.length < 20) {
            itemCache.hasMore = false;
          }
          itemCache.page++;
          itemCache.messages.unshift(...newMessages);
        }),
        map(() => void 0)
      );
  }

  private ensureChat(chatId: string) {
    if (!this.cache.has(chatId)) {
      this.cache.set(chatId, { messages: [], hasMore: true, page: 0 });
    }
    return this.cache.get(chatId)!;
  }

  sendMessage({ chatId, content, media }: CreateMessageData) {
    const data = media
      ? {
          type: media.type,
          media: {
            fileName: media.fileName,
            originalName: media.originalName,
          },
        }
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
        tap(({ chat, message }) => {
          // * Index 0 = last messages
          const key = `${chatId}-0`;
          if (this.messagesCache[key]) {
            // * Deep clone for break reference
            this.messagesCache[key] = [...this.messagesCache[key], message];
          }
        })
      );
  }

  markChatAsRead(chatId: string) {
    return this.http
      .patch<{ message: string }>(`${this.URL}/${chatId}/read`, {})
      .pipe(
        tap(() => {
          const key = `${chatId}-0`;
          if (this.messagesCache[key]) {
            this.messagesCache[key] = this.messagesCache[key].map((item) => ({
              ...item,
              isRead: true,
            }));
          }
        })
      );
  }

  listenForNewMessages() {
    return this.chatSubject$.asObservable().pipe(
      share(),
      map((data) => {
        const chat = ChatMapper.fromResponse(data.chat);
        const message = MessageMapper.fromResponse(data.message);
        return { chat, message };
      }),
      tap(({ chat, message }) => {
        console.log('EXECE LIENST');
        const key = `${chat.id}-0`;
        if (this.messagesCache[key]) {
          this.messagesCache[key] = [
            ...structuredClone(this.messagesCache[key]),
            message,
          ];
        }
      })
    );
  }

  listenForChatSeen(): Observable<string> {
    return this.chatReadSubject$.pipe(
      tap((chatId) => {
        const key = `${chatId}-0`;
        if (this.messagesCache[key]) {
          this.messagesCache[key] = this.messagesCache[key].map((item) => ({
            ...item,
            isRead: true,
          }));
        }
      }),
      share()
    );
  }

  uploadFile(file: File) {
    const uploadUrl = `${environment.base_url}/files/chat`;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadedFile>(uploadUrl, formData);
  }

  openAccountChat(accountId: string) {
    if (this.overlayRef) return;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .bottom('16px')
        .right('16px'),
    });
    const portalInjector = Injector.create({
      providers: [
        { provide: OverlayRef, useValue: this.overlayRef },
        { provide: 'CHAT_DATA', useValue: { account: accountId } },
      ],
      parent: this.injector,
    });
    const portal = new ComponentPortal(
      ChatOverlayComponent,
      null,
      portalInjector
    );
    this.overlayRef.attach(portal);
  }

  closeAccountChat() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
