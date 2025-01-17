import { CommonModule, ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Signal,
  signal,
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
export default class FoldersComponent {
  folders = signal<any[]>([
    
      {
        _id: '6776916c8b103470b6e0279b',
        name: 'Archivados',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '6776917c8b103470b6e027bb',
        name: 'No concluidos',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '6776920a8b103470b6e0280f',
        name: 'Eliminados',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678814cd09d40d87b23f1312',
        name: 'Completados 2024',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678814e509d40d87b23f131a',
        name: 'Extraviados',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a5439446ba00d1dfb9ba0',
        name: 'Flder ejemplo',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a543f446ba00d1dfb9ba8',
        name: '2023',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a5444446ba00d1dfb9bb0',
        name: 'POR REVISAR',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a5450446ba00d1dfb9bb8',
        name: 'Varios',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a545b446ba00d1dfb9bc0',
        name: 'Sin designar',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a546a446ba00d1dfb9bc8',
        name: 'Sin funcionario',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a5476446ba00d1dfb9bd0',
        name: 'ejemplo',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
      {
        _id: '678a547f446ba00d1dfb9bd8',
        name: 'fin de mes',
        dependency: '63af6409ac7469b4ea9feef8',
        __v: 0,
      },
    ],
  );
  private alertService = inject(AlertService);
  viewportScroller = inject(ViewportScroller);
  scrollingRef = viewChild<HTMLElement>('scrolling');

  constructor(
    private dialog: MatDialog,
    private archiveService: FolderService
  ) {
    // this.loadFolders();
    const scrollingPosition: Signal<[number, number] | undefined> = toSignal(
      inject(Router).events.pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        map((event: Scroll) => event.position || [0, 0])
      )
    );

    effect(() => {
      if (this.scrollingRef() && scrollingPosition()) {
        this.viewportScroller.scrollToPosition(scrollingPosition()!);
      }
    });
  }

  loadFolders() {
    this.archiveService.getFolders().subscribe({
      next: (data) => {
        this.folders.set(data);
        console.log(data);
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
