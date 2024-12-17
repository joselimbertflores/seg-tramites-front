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
    templateUrl: './profile.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
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
