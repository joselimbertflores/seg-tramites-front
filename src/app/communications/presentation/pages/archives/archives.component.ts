import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-archives',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule,CommonModule],
  templateUrl: './archives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArchivesComponent { 
  folders = [
    { name: 'Documentos' },
    { name: 'Imágenes' },
    { name: 'Videos' },
    { name: 'Proyectos' },
    { name: 'Descargas' },
    { name: 'Música' },
    { name: 'Presentaciones' },
    { name: 'Reportes' },
  ];
  selectedFolder: number | null = null;

  selectFolder(index: number): void {
    this.selectedFolder = this.selectedFolder === index ? null : index;
  }

  deleteFolder(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Evita que el evento cierre la selección
    this.folders.splice(index, 1); // Elimina la carpeta
    if (this.selectedFolder === index) {
      this.selectedFolder = null; // Deselecciona la carpeta eliminada
    }
  }
}
