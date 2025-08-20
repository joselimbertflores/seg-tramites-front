import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { publication } from '../../../publications/infrastructure';
import { Communication } from '../../../communications/domain';
import { IUserSocket } from '../../infrastructure';
import {
  communication,
  CommunicationMapper,
} from '../../../communications/infrastructure';
import {
  ChatMapper,
  ChatResponse,
  MessageMapper,
  MessageResponse,
} from '../../../chat/infrastructure';

interface ChatEventData {
  chat: ChatResponse;
  message: MessageResponse;
}
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private onlineClientsSubject = new BehaviorSubject<IUserSocket[]>([]);

  onlineClients$ = this.onlineClientsSubject.asObservable();

  private chatSubject$ = new Subject<ChatEventData>();

  public messages$ = this.chatSubject$.asObservable().pipe(
    map((data) => {
      const chat = ChatMapper.fromResponse(data.chat);
      const message = MessageMapper.fromResponse(data.message);
      return { chat, message };
    })
  );

  connect(): void {
    this.socket = io(environment.socket_url, {
      auth: { token: localStorage.getItem('token') },
    });
    console.log('socket start');
    this.socket.on('chat', (data: ChatEventData) => {
      this.chatSubject$.next(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }

  listenUserConnections(): void {
    this.socket.on('clientsList', (users: IUserSocket[]) => {
      this.onlineClientsSubject.next(users);
    });
  }

  listenNewCommunications(): Observable<Communication> {
    return new Observable((observable) => {
      this.socket.on('new-communication', (data: communication) => {
        observable.next(CommunicationMapper.fromResponse(data));
      });
    });
  }

  listenCancelCommunications(): Observable<string> {
    return new Observable((observable) => {
      this.socket.on('cancel-communication', (communicationId: string) => {
        observable.next(communicationId);
      });
    });
  }

  listenKickUsers(): Observable<string> {
    return new Observable((observable) => {
      this.socket.on('userKicked', (message: string) => {
        observable.next(message);
      });
    });
  }

  listNews(): Observable<publication> {
    return new Observable((observable) => {
      this.socket.on('news', (message: publication) => {
        observable.next(message);
      });
    });
  }

  kickUsers(userIds: string[], message: string | null) {
    this.socket.emit('kickUser', { userIds, message: message ?? '' });
  }

  closeOne(name: string) {
    this.socket.removeListener(name);
  }

  get currentOnlineUsers() {
    return this.onlineClientsSubject.getValue();
  }
}
