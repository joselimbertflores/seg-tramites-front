import { CommonModule } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';

import { ResourceDialogComponent } from '../../dialogs/resource-dialog/resource-dialog.component';
import { FileIconPipe, FileUploadService } from '../../../../shared';
import { ResourceService } from '../../services/resource.service';
import { groupedResource, resourceFile } from '../../../infrastructure';

@Component({
  selector: 'app-resources',
  imports: [
    CommonModule,
    CdkAccordionModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    FileIconPipe,
  ],
  templateUrl: './resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResourcesComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private fileUploadService = inject(FileUploadService);
  private resourceService = inject(ResourceService);

  expandedIndex = 0;
  groupedResources = signal<groupedResource[]>([]);

  ngOnInit(): void {
    this.getResources();
  }

  create() {
    const dialogRef = this.dialogRef.open(ResourceDialogComponent, {
      minWidth: '600px',
    });
    dialogRef.afterClosed().subscribe((result: groupedResource) => {
      if (!result) return;
      this.groupedResources.update((values) => {
        const index = values.findIndex(
          ({ category }) => category === result.category
        );
        if (index === -1) return [result, ...values];
        values[index].files.push(...result.files);
        return [...values];
      });
    });
  }

  remove(item: resourceFile) {
    this.resourceService.remove(item._id).subscribe(() => {
      // this.groupedResources.update((values) => {
      //   const index = values.findIndex(({ files }) => files.some(({ _id }) => _id === item._id));
      //   if(index===-1) return [...values]
      //   values[index].files=values[index].files.filter((({_id})=>_id!==item._id))
      //   if()
      //   return [...values];
      // });
    });
  }

  download({ fileName, originalName }: resourceFile) {
    this.fileUploadService.downloadFileFromUrl(fileName, originalName);
  }

  getResources() {
    this.resourceService.findAllGroupedByCategory().subscribe((data) => {
      this.groupedResources.set(data);
    });
  }
}
