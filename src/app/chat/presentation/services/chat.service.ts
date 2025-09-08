import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import {
  BehaviorSubject,
  Observable,
  finalize,
  Subject,
  share,
  map,
  tap,
} from 'rxjs';
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
  page: number; // página del backend
  hasMore: boolean; // si quedan más mensajes
}

type scrollType = 'init' | 'scroll' | 'new';
interface ActiveMessagesData {
  scrollType?: scrollType;
  messages: Message[];
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

  private readonly _chatSubject = new Subject<ChatEventData>();
  readonly chatSubject$ = this._chatSubject.asObservable().pipe(
    map(({ message, chat }) => ({
      chat: ChatMapper.fromResponse(chat),
      message: MessageMapper.fromResponse(message),
    })),
    tap(({ message }) => {
      this.insertNewMessage(message);
    }),
    share()
  );

  private chatReadSubject$ = new Subject<string>();

  // * Cache messages
  private limit = 20;
  private caches = new Map<string, ChatCache>();
  private activeChatId: string | null = null;
  private activeMessages$ = new BehaviorSubject<ActiveMessagesData>({
    messages: [],
  });
  private _isLoading = signal(false);
  isLoading = computed(() => this._isLoading());

  constructor() {
    this.socketRef = this.socketService.getSocket();
    this.initListeners();
  }

  messages$(): Observable<ActiveMessagesData> {
    return this.activeMessages$.asObservable();
  }

  /** Selecciona un chat (siempre muestra los últimos 20) */
  selectChat(chatId: string): void {
    this.activeChatId = chatId;
    this.activeMessages$.next({ messages: [] });
    const cache = this.ensureCache(chatId);
    if (cache.messages.length > 0) {
      this.emitSlice(cache, 1, "init");
    } else {
      this.fetchAndCache(chatId, 0).subscribe(() => {
        this.emitSlice(this.ensureCache(chatId), 1, 'init');
      });
    }
  }

  loadMore(): void {
    if (!this.activeChatId || this._isLoading()) return;
    const chatId = this.activeChatId;

    const cache = this.ensureCache(chatId);
    const currentCount = this.activeMessages$.value.messages.length;

    if (currentCount < cache.messages.length) {
      const pages = Math.ceil(currentCount / this.limit) + 1;
      this.emitSlice(cache, pages, "scroll");
    } else if (cache.hasMore) {
      this.fetchAndCache(chatId, cache.page).subscribe(() => {
        const pages = Math.ceil(currentCount / this.limit) + 1;
        this.emitSlice(this.ensureCache(chatId), pages, 'scroll');
      });
    }
  }

  // ---------------- helpers ----------------
  private ensureCache(chatId: string): ChatCache {
    if (!this.caches.has(chatId)) {
      this.caches.set(chatId, { messages: [], page: 0, hasMore: true });
    }
    return this.caches.get(chatId)!;
  }

  private emitSlice(
    cache: ChatCache,
    pages: number,
    scrollType?: scrollType
  ): void {
    const toTake = this.limit * pages;
    this.activeMessages$.next({
      messages: cache.messages.slice(-toTake),
      scrollType,
    });
  }

  private fetchAndCache(chatId: string, page: number): Observable<Message[]> {
    this._isLoading.set(true);
    console.log('GETTING FORM BACKEND PAGE:', page);
    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`, {
        params: { offset: page * this.limit, limit: this.limit },
      })
      .pipe(
        map((resp) => resp.map((item) => MessageMapper.fromResponse(item))),
        tap((msgs) => {
          const cache = this.ensureCache(chatId);
          if (page === 0) {
            // primera carga
            cache.messages = msgs;
          } else {
            // scroll up → prepend
            cache.messages = [...msgs, ...cache.messages];
          }
          cache.page = page + 1;
          cache.hasMore = msgs.length === this.limit;
        }),
        finalize(() => this._isLoading.set(false))
      );
  }

  geChats() {
    return this.http
      .get<ChatResponse[]>(this.URL)
      .pipe(map((resp) => resp.map((item) => ChatMapper.fromResponse(item))));
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
        tap(({ message }) => {
          this.insertNewMessage(message);
        })
      );
  }

  markChatAsRead(chatId: string) {
    return this.http
      .patch<{ message: string }>(`${this.URL}/${chatId}/read`, {})
      .pipe(
        tap(() => {
          // const key = `${chatId}-0`;
          // if (this.messagesCache[key]) {
          //   this.messagesCache[key] = this.messagesCache[key].map((item) => ({
          //     ...item,
          //     isRead: true,
          //   }));
          // }
        })
      );
  }

  listenForChatSeen(): Observable<string> {
    return this.chatReadSubject$.pipe(
      tap((chatId) => {
        // const key = `${chatId}-0`;
        // if (this.messagesCache[key]) {
        //   this.messagesCache[key] = this.messagesCache[key].map((item) => ({
        //     ...item,
        //     isRead: true,
        //   }));
        // }
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

  private initListeners(): void {
    if (!this.socketRef) return;

    this.socketRef.on('sendMessage', (data: ChatEventData) => {
      this._chatSubject.next(data);
    });

    this.socketRef.on('readMessage', (chatId: string) => {
      this.chatReadSubject$.next(chatId);
    });
  }

  private insertNewMessage(msg: Message): void {
    // *al recibir un mensaje del socket o al emitir uno
    const cache = this.ensureCache(msg.chat);
    cache.messages.push(msg);

    if (this.activeChatId === msg.chat) {
      // si es el chat activo → emitir
      const currentCount = this.activeMessages$.value.messages.length;
      const pages = Math.ceil(currentCount / this.limit);
      this.emitSlice(cache, pages);
    }
  }
}
