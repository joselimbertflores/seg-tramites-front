import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { PublicationDialogComponent } from '../../../../publications/presentation/components';
import { PostService } from '../../../../publications/presentation/services/post.service';
import { AuthService } from '../../../../auth/presentation/services/auth.service';

@Component({
  selector: 'app-main',
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center px-2"
    >
      <img
        src="images/institution/escudo.png"
        alt="Logo"
        class="h-32 sm:h-52 mb-6"
      />
      <h1 class="text-xl sm:text-3xl font-bold tracking-wide">
        ¡Bienvenid&#64; {{ userName ?? 'Usuario' | uppercase }}!
      </h1>
      <p class="text-gray-600 mt-2 italic">
        "Gestiona tus trámites, desde el inicio hasta su conclusión"
      </p>
      <p class="text-xs mt-8">Versión 2.1.0</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainComponent implements OnInit {
  private dialog = inject(MatDialog);
  private publicationService = inject(PostService);

  userName = inject(AuthService).user()?.fullname.split(' ')[0].toUpperCase();

  ngOnInit(): void {
    this._showNews();
  }

  private _showNews(): void {
    this.publicationService.getNews().subscribe((publications) => {
      if (publications.length === 0) return;
      this.dialog.open(PublicationDialogComponent, {
        minWidth: '900px',
        height: '600px',
        data: publications,
      });
    });
  }
}
