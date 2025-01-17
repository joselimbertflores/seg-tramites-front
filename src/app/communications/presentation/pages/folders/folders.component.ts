import { CommonModule, ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  Signal,
  signal,
  ViewChild,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FolderDialogComponent } from './folder-dialog/folder-dialog.component';
import { FolderService } from '../../services/folder.service';
import { AlertService } from '../../../../shared';
import { Router, RouterModule, Scroll } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-folders',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './folders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .mybox{
   
      box-shadow: var(--mat-sys-level2);
    }

    .mybox:hover {
      background:var(--mat-sys-primary-fixed);
    }

  `,
})
export default class FoldersComponent implements OnInit {
  folders = signal<any[]>([]);
  private alertService = inject(AlertService);

  constructor(
    private dialog: MatDialog,
    private archiveService: FolderService
  ) {}
  
  ngOnInit(): void {
    this.loadFolders();
  }

  loadFolders() {
    this.archiveService.getFolders().subscribe({
      next: (data) => {
        this.folders.set(data);
      },
      error: (err) => {
        console.error('Error al cargar carpetas:', err);
      },
    });
  }

  openCreateFolderDialog() {
    const dialogRef = this.dialog.open(FolderDialogComponent);

    dialogRef.afterClosed().subscribe((folderName) => {
      if (folderName) {
        this.archiveService.createFolder(folderName).subscribe({
          next: (newFolder) => {
            this.folders.update((values) => [...values, newFolder]); // Agregar la nueva carpeta a la lista
            console.log('Carpeta creada:', newFolder);
          },
          error: (err) => {
            console.error('Error al crear carpeta:', err);
          },
        });
      }
    });
  }

  deleteFolder(id: string, event: Event) {
    event.stopPropagation();
    this.alertService
      .confirmDialog({
        title: 'Eliminar carpeta?',
        description: 'Se borrara la carpeta seleccionada',
      })
      .subscribe((result) => {
        if (!result) return;

        this.archiveService.deleteFolder(id).subscribe({
          next: () => {
            this.folders.set(
              this.folders().filter((folder) => folder._id !== id)
            );
            console.log('Carpeta eliminada:', id);
          },
          error: (err) => {
            console.error('Error al eliminar carpeta:', err);
          },
        });
      });
  }
}
