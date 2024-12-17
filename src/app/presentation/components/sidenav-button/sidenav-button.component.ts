import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppearanceService } from '../../services';

@Component({
    selector: 'sidenav-button',
    imports: [CommonModule, MatButtonModule, MatIconModule],
    template: ` <button mat-icon-button (click)="toggleSidenav()">
    <mat-icon>menu</mat-icon>
  </button>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavButtonComponent {
  appearanceService = inject(AppearanceService);

  toggleSidenav() {
    this.appearanceService.isSidenavToggle.update((val) => !val);
  }
}
