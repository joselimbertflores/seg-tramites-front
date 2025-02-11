import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services';

@Component({
  selector: 'profile',
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <div class="p-2">
      <div class="flex flex-col gap-y-2 items-center pb-4">
        <img
          class="h-auto rounded-full w-14"
          src="images/icons/account.png"
          alt="User image"
        />
        <span class="text-lg font-bold leading-8">
          {{ user?.fullname | titlecase }}
        </span>
        <span
          class="rounded-full bg-green-200 py-1 px-2 text-xs font-medium text-green-700"
        >
          En linea
        </span>
      </div>

      <mat-action-list>
        <button mat-list-item routerLink="/home/settings">
          <mat-icon matListItemIcon>manage_accounts</mat-icon>
          <div matListItemTitle>Configuracciones</div>
        </button>
        <mat-divider />
        <button mat-list-item routerLink="home" (click)="logout()">
          <mat-icon matListItemIcon>logout</mat-icon>
          <div matListItemTitle>Cerrar sesion</div>
        </button>
      </mat-action-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private authService = inject(AuthService);
  isOpen = model.required<boolean>();

  logout() {
    this.authService.logout();
    this.isOpen.set(false);
  }

  get user() {
    return this.authService.user();
  }
}
