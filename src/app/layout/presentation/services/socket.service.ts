import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  SocketClient,
  communicationResponse,
} from '../../../infraestructure/interfaces';
import { Communication } from '../../../domain/models';
import { publication } from '../../../publications/infrastructure';
import { userSocket } from '../../infrastructure';
import { communication } from '../../../communications/infrastructure';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  private onlineClientsSubject = new BehaviorSubject<SocketClient[]>([]);
  public onlineClients$ = this.onlineClientsSubject.asObservable();

  constructor() {
    this.socket = io(environment.base_url, {
      auth: { token: localStorage.getItem('token') },
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }

  listenUserConnections(): void {
    this.socket.on('listar', (users: userSocket[]) => {
      this.onlineClientsSubject.next(users);
    });
  }

  listenCommunications(): Observable<communication> {
    return new Observable((observable) => {
      this.socket.on('new-communication', (data: communication) => {
        observable.next(data);
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

  listExpel(): Observable<string> {
    return new Observable((observable) => {
      this.socket.on('has-expel', (message: string) => {
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

  expelClient(id_account: string, message: string) {
    this.socket.emit('expel', { id_account, message });
  }

  closeOne(name: string) {
    this.socket.removeListener(name);
  }
}
