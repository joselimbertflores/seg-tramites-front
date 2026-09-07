import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { publication } from '../../../publications/infrastructure';
import { Communication } from '../../../communications/domain';
import { IUserSocket } from '../../infrastructure';
import {
  communication,
  CommunicationMapper,
} from '../../../communications/infrastructure';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private retryTimer?: ReturnType<typeof setTimeout>;

  private onlineClientsSubject = new BehaviorSubject<IUserSocket[]>([]);
  onlineClients$ = this.onlineClientsSubject.asObservable();

  connect(): void {
    if (this.socket) return;
    this.socket = io(environment.socket_url, {
      withCredentials: true,
    });
    this.socket.on('sessionUnavailable', () => {
      clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => this.socket?.connect(), 5000);
    });
    this.socket.on('connect_error', (error: Error) => {
      if (error.message !== 'session_unavailable') return;
      clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => this.socket?.connect(), 5000);
    });
  }

  disconnect(): void {
    clearTimeout(this.retryTimer);
    this.onlineClientsSubject.next([]);
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  listenUserConnections(): void {
    this.socket?.on('clientsList', (users: IUserSocket[]) => {
      this.onlineClientsSubject.next(users);
    });
  }

  listenNewCommunications(): Observable<Communication> {
    return new Observable((observable) => {
      this.socket?.on('new-communication', (data: communication) => {
        observable.next(CommunicationMapper.fromResponse(data));
      });
    });
  }

  listenCancelCommunications(): Observable<string> {
    return new Observable((observable) => {
      this.socket?.on('cancel-communication', (communicationId: string) => {
        observable.next(communicationId);
      });
    });
  }

  listenKickUsers(): Observable<string> {
    return new Observable((observable) => {
      this.socket?.on('userKicked', (message: string) => {
        observable.next(message);
      });
    });
  }

  listNews(): Observable<publication> {
    return new Observable((observable) => {
      this.socket?.on('news', (message: publication) => {
        observable.next(message);
      });
    });
  }

  kickUsers(userIds: string[], message: string | null) {
    this.socket?.emit('kickUser', { userIds, message: message ?? '' });
  }

  closeOne(name: string) {
    this.socket?.removeListener(name);
  }

  getSocket() {
    return this.socket;
  }

  get currentOnlineUsers() {
    return this.onlineClientsSubject.getValue();
  }
}
