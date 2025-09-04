import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import {
  BehaviorSubject,
  map,
  Observable,
  of,
  share,
  Subject,
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
  messages: Message[]; // Ordenados cronológicamente (antiguos -> nuevos)
  currentPage: number; // Página actual del backend
  hasMore: boolean;
  displayedCount: number; // Cuántos mensajes están siendo mostrados
  subject: BehaviorSubject<Message[]>;
}

type ScrollMode = 'bottom' | 'restore';
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

  private chatSubject$ = new Subject<ChatEventData>();
  private chatReadSubject$ = new Subject<string>();

  chatCache = new Map<string, ChatCache>();
  private limit = 20;

  constructor() {
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

  // Suscribirse en el componente
  getMessages$(chatId: string): Observable<Message[]> {
    const chatCache = this.ensureChat(chatId);

    return chatCache.subject.asObservable();
  }

  geChats() {
    return this.http
      .get<ChatResponse[]>(this.URL)
      .pipe(map((resp) => resp.map((item) => ChatMapper.fromResponse(item))));
  }

  // Mejorar loadMessages
  loadMessages(chatId: string, mode: ScrollMode): void {
    const chatCache = this.ensureChat(chatId);

    // Si hay mensajes en cache que no se han mostrado
    if (chatCache.displayedCount < chatCache.messages.length) {
      const newDisplayedCount = Math.min(
        chatCache.displayedCount + this.limit,
        chatCache.messages.length
      );

      // Tomar desde el final menos los que ya se muestran
      const startIndex = Math.max(
        0,
        chatCache.messages.length - newDisplayedCount
      );
      const messagesToShow = chatCache.messages.slice(startIndex);

      chatCache.displayedCount = newDisplayedCount;
      chatCache.subject.next(messagesToShow);
      this.scrollAction$.next(mode);
      return;
    }

    // Si no hay más en cache, pedir al backend
    if (chatCache.hasMore) {
      this.fetchFromBackend(chatId, chatCache.currentPage).subscribe(
        (newMessages) => {
          if (newMessages.length < this.limit) {
            chatCache.hasMore = false;
          }

          // Agregar los nuevos mensajes AL INICIO del array (son más antiguos)
          chatCache.messages = [...newMessages, ...chatCache.messages];
          chatCache.currentPage++;

          // Actualizar la cuenta de mostrados
          chatCache.displayedCount = Math.min(
            chatCache.displayedCount + newMessages.length,
            chatCache.messages.length
          );

          // Mostrar desde el final del array (más nuevos al final)
          const startIndex = Math.max(
            0,
            chatCache.messages.length - chatCache.displayedCount
          );
          const messagesToShow = chatCache.messages.slice(startIndex);

          chatCache.subject.next(messagesToShow);
          this.scrollAction$.next(mode);
        }
      );
    }
  }

  private fetchFromBackend(
    chatId: string,
    page: number
  ): Observable<Message[]> {
    const offset = page * this.limit;
    return this.http.get<Message[]>(`${this.URL}/${chatId}/messages`, {
      params: { limit: this.limit, offset },
    });
  }
  resetChatView(chatId: string): void {
    const chatCache = this.ensureChat(chatId);
    chatCache.displayedCount = 0;
    chatCache.subject.next([]);

    // Si ya hay mensajes en cache, mostrar los últimos 20
    if (chatCache.messages.length > 0) {
      const startIndex = Math.max(0, chatCache.messages.length - this.limit);
      chatCache.displayedCount = Math.min(
        this.limit,
        chatCache.messages.length
      );
      chatCache.subject.next(chatCache.messages.slice(startIndex));
      this.scrollAction$.next('bottom');
    } else {
      // Si no hay cache, cargar del backend
      this.loadMessages(chatId, 'bottom');
    }
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

    // if (this.messagesCache[key]) return of([...this.messagesCache[key]]);

    const params = new HttpParams({
      fromObject: { limit: 20, offset: index * 20 },
    });
    return this.http
      .get<MessageResponse[]>(`${this.URL}/${chatId}/messages`, { params })
      .pipe(
        map((resp) => resp.map((item) => MessageMapper.fromResponse(item))),
        tap((messages) => {
          // if (messages.length > 0) {
          //   this.messagesCache[key] = messages;
          // }
        })
      );
  }

  private scrollAction$ = new Subject<ScrollMode>();
  getScrollAction$(): Observable<ScrollMode> {
    return this.scrollAction$.asObservable();
  }

  ensureChat(chatId: string) {
    if (!this.chatCache.has(chatId)) {
      this.chatCache.set(chatId, {
        messages: [],
        hasMore: true,
        displayedCount: 0,
        currentPage: 0,
        subject: new BehaviorSubject<Message[]>([]),
      });
    }
    return this.chatCache.get(chatId)!;
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
          // // * Index 0 = last messages
          // const key = `${chatId}-0`;
          // if (this.messagesCache[key]) {
          //   // * Deep clone for break reference
          //   this.messagesCache[key] = [...this.messagesCache[key], message];
          // }
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

  listenForNewMessages() {
    return this.chatSubject$.asObservable().pipe(
      share(),
      map((data) => {
        const chat = ChatMapper.fromResponse(data.chat);
        const message = MessageMapper.fromResponse(data.message);
        return { chat, message };
      }),
      tap(({ chat, message }) => {
        // const key = `${chat.id}-0`;
        // if (this.messagesCache[key]) {
        //   this.messagesCache[key] = [
        //     ...structuredClone(this.messagesCache[key]),
        //     message,
        //   ];
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
}
