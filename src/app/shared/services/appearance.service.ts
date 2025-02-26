import { DOCUMENT } from '@angular/common';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Inject, Injectable, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppearanceService {
  public isAppLoading = signal<boolean>(false);
  public isDarkTheme = signal<boolean>(false);
  public isSidenavToggle = signal(true);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private overlay: Overlay
  ) {}

  toggleTheme() {
    this.isDarkTheme.update((value) => !value);
  }
}
