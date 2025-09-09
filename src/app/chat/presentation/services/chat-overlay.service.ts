import { inject, Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { ChatOverlayComponent } from '../components';

@Injectable({
  providedIn: 'root',
})
export class ChatOverlayService {
  private overlay = inject(Overlay);
  private injector: Injector;
  private overlayRef: OverlayRef | null = null;

  constructor() {}

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
