import { CommonModule } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';

import {
  AlertService,
  FileIconPipe,
  FilePreviewDialogComponent,
  FileUploadService,
  HasPermissionDirective,
} from '../../../../shared';
import { ResourceService } from '../../services/resource.service';
import { validResource } from '../../../../auth/infrastructure';
import { resourceFile } from '../../../infrastructure';
import { ResourceDialogComponent } from '../../dialogs/resource-dialog/resource-dialog.component';
import { Dialog } from '@angular/cdk/dialog';
@Component({
  selector: 'app-resources',
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FileIconPipe,
    MatExpansionModule,
    HasPermissionDirective,
  ],
  templateUrl: './resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    mat-expansion-panel-header {
       height: 50px; 
    }
  `,
})
export default class ResourcesComponent {
  private dialogRef = inject(MatDialog);
  private fileUploadService = inject(FileUploadService);
  private resourceService = inject(ResourceService);
  private alertService = inject(AlertService);

  accordion = viewChild.required(MatAccordion);
  isLoading = computed(() => this.resourceService.isLoading());
  term = signal<string>('');

  public readonly PERMISSION = validResource;
  dialog = inject(Dialog);

  filteredGroupedResources = computed(() => {
    if (!this.term()) return this.resourceService.resources();
    const lowerQuery = this.term().toLowerCase();
    const filtered = this.resourceService
      .resources()
      .map((group) => ({
        category: group.category,
        files: group.files.filter(({ originalName }) =>
          originalName.toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter((group) => group.files.length > 0);

    setTimeout(() => {
      this.accordion().openAll();
    });
    return filtered;
  });

  create() {
    this.dialogRef.open(ResourceDialogComponent, {
      minWidth: '600px',
      autoFocus: false,
    });
  }

  remove(item: resourceFile) {
    this.alertService
      .confirmDialog({
        title: 'Eliminar archivo',
        description: '¿Estás seguro de que desea eliminar este archivo?',
      })
      .pipe(
        filter((confirmed) => confirmed),
        switchMap(() => this.resourceService.remove(item._id, item.category))
      )
      .subscribe();
  }

  download({ fileName, originalName }: resourceFile) {
    this.fileUploadService.downloadFileFromUrl(fileName, originalName);
  }

  isPreviewable(file: resourceFile): boolean {
    const ext = file.originalName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'].includes(ext ?? '');
  }

  preview(file: resourceFile) {
    this.dialog.open(FilePreviewDialogComponent, {
      height: '100vh',
      width: '100vw',
      data: {fileName:file.fileName},
      panelClass: 'file-preview-dialog',
    });
  }
}
