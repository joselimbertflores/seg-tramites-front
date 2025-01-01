import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ArchiveDialogComponent } from './archive-dialog/archive-dialog.component';
import { ArchiveService } from '../../services/archive.service';

@Component({
  selector: 'app-archives',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule,CommonModule],
  templateUrl: './archives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArchivesComponent { 
  folders = signal<any[]>([]);

  constructor(private dialog: MatDialog,private archiveService: ArchiveService) {
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
    const dialogRef = this.dialog.open(ArchiveDialogComponent);

    dialogRef.afterClosed().subscribe((folderName) => {
      if (folderName) {
        this.archiveService.createFolder(folderName).subscribe({
          next: (newFolder) => {
            this.folders.update((values)=>[...values,newFolder]); // Agregar la nueva carpeta a la lista
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
    this.archiveService.deleteFolder(id).subscribe({
      next: () => {
        this.folders.set( this.folders().filter((folder) => folder._id !== id));
        console.log('Carpeta eliminada:', id);
      },
      error: (err) => {
        console.error('Error al eliminar carpeta:', err);
      },
    });
  }
}
