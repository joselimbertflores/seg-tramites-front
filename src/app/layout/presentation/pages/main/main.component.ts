import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../presentation/services';
import { PublicationDialogComponent } from '../../../../publications/presentation/components';
import { PostService } from '../../../../publications/presentation/services/post.service';

@Component({
    selector: 'app-main',
    imports: [CommonModule],
    template: `
    <div class="flex flex-col h-full">
      <div class="grow">
        <div class="flex justify-center  items-center h-full">
          <p class="text-md sm:text-2xl">Bienvenid&#64; {{ fullname }}</p>
        </div>
      </div>
      <div class="h-auto p-2">
        <span class="block font-light">Sistema de Seguimiento de Tramites</span>
        <span class="block font-bold text-sm">Version 1.9</span>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class MainComponent implements OnInit {
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private publicationService = inject(PostService);

  fullname = '"'

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
