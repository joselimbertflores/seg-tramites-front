import { CommonModule } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  OnInit,
  resource,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkAccordion, CdkAccordionModule } from '@angular/cdk/accordion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';

import { ResourceDialogComponent } from '../../dialogs/resource-dialog/resource-dialog.component';
import {
  FileIconPipe,
  FileUploadService,
  HasPermissionDirective,
} from '../../../../shared';
import { ResourceService } from '../../services/resource.service';
import { groupedResource, resourceFile } from '../../../infrastructure';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { validResource } from '../../../../auth/infrastructure';
import { finalize } from 'rxjs';
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
    MatInputModule,
    FileIconPipe,
    FormsModule,
    MatExpansionModule,
    HasPermissionDirective,
  ],
  templateUrl: './resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    // mat-expansion-panel-header {
    //   height: 50px; 
    // }
  `,
})
export default class ResourcesComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private fileUploadService = inject(FileUploadService);
  private resourceService = inject(ResourceService);
  accordion = viewChild.required(MatAccordion);

  expansion = viewChildren<CdkAccordion>(MatAccordion);
  groupedResources = signal<groupedResource>({});

  term = signal<string>('');
  isLoading = signal(false);

  public readonly PERMISSION = validResource;

  filteredGroupedResources = computed(() => {
    return Object.entries(this.groupedResources()).map(([category, files]) => ({
      category,
      files,
    }));
    // if (!this.term()) return this.groupedResources();
    // return this.groupedResources().filter((values) =>
    //   values.files.some(({ originalName }) =>
    //     originalName.toLowerCase().includes(this.term().toLowerCase())
    //   )
    // );
  });

  ngOnInit(): void {
    this.getResources();
  }

  create() {
    const dialogRef = this.dialogRef.open(ResourceDialogComponent, {
      minWidth: '600px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result: groupedResource) => {
      if (!result) return;
      // this.groupedResources.update((values) => {
      //   const index = values.findIndex(
      //     ({ category }) => category === result.category
      //   );

      //   if (index === -1) {
      //     return [result, ...values];
      //   }

      //   const updatedGroup = {
      //     ...values[index],
      //     files: [...result.files, ...values[index].files],
      //   };
      //   return [
      //     ...values.slice(0, index),
      //     updatedGroup,
      //     ...values.slice(index + 1),
      //   ];
      // });
    });
  }

  remove(item: resourceFile) {
    this.resourceService.remove(item._id).subscribe(() => {
      // this.groupedResources.update((values) =>
      //   values
      //     .map((group) => {
      //       if (group.category !== item.category) return group;
      //       return {
      //         ...group,
      //         files: group.files.filter((file) => file._id !== item._id),
      //       };
      //     })
      //     .filter((group) => group.files.length > 0)
      // );
    });
  }

  download({ fileName, originalName }: resourceFile) {
    console.log(fileName);
    this.fileUploadService.downloadFileFromUrl(fileName, originalName);
  }

  getResources() {
    this.isLoading.set(true);
    this.resourceService
      .findAllGroupedByCategory()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((data) => {
        this.groupedResources.set(data);
      });
  }
}
