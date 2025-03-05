import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { FolderDialogComponent } from './folder-dialog/folder-dialog.component';
import { FolderService } from '../../services/folder.service';
import {
  AlertService,
  CacheService,
  RestoreScrollDirective,
} from '../../../../shared';
import { folder } from '../../../infrastructure';

@Component({
  selector: 'app-folders',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    RouterModule,
    RestoreScrollDirective,
  ],
  templateUrl: './folders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .box-folder{
      background: var(--mat-sys-surface-container);
    }
    .box-folder:hover {
      background:var(--mat-sys-surface-dim);
    }
  `,
})
export default class FoldersComponent implements OnInit {
  folders = signal<folder[]>([]);
  private alertService = inject(AlertService);
  private cacheService = inject(CacheService);
  isLoading = signal<boolean>(false);

  constructor(
    private dialog: MatDialog,
    private archiveService: FolderService
  ) {}

  ngOnInit(): void {
    this.loadFolders();
  }

  loadFolders() {
    this.isLoading.set(true);
    this.archiveService.getFolders().subscribe((folders) => {
      this.folders.set(folders);
      this.isLoading.set(false);
    });
  }

  create() {
    const dialogRef = this.dialog.open(FolderDialogComponent, {
      width: '500px',
      maxWidth: '500px',
    });
    dialogRef.afterClosed().subscribe((folder) => {
      if (!folder) return;
      this.folders.update((values) => [folder, ...values]);
    });
  }

  delete(id: string, event: Event) {
    event.stopPropagation();
    this.alertService
      .confirmDialog({
        title: '¿Eliminar carpeta?',
        description: 'Se borrara la carpeta seleccionada',
      })
      .subscribe((result) => {
        if (!result) return;
        this.archiveService.delete(id).subscribe(() => {
          this.folders.update((values) =>
            values.filter((item) => item._id !== id)
          );
        });
      });
  }
}
