import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { PdfService, PdfDisplayComponent } from '../../../../shared';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { finalize, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { ProcessService } from '../../services';
import {
  buildPaths,
  buildPathTo,
  resolveWorkflowPaths,
  resolveWorkflowPathTo,
} from '../../../../procedures/presentation/helpers';
import { Procedure } from '../../../../procedures/domain';

interface data {
  procedure: Procedure;
  communicationId?: string;
}
interface pdfBlobItem {
  blob: Blob;
  title: string;
}
@Component({
  selector: 'app-route-map-dialog',
  imports: [CommonModule, MatTabsModule, MatDialogModule, PdfDisplayComponent],
  template: `
    <h2 mat-dialog-title>Hoja de Ruta</h2>
    <mat-dialog-content>
      <mat-tab-group>
        @for (item of pdfBlobList(); track $index) {
        <mat-tab [label]="item.title">
          <pdf-display [pdfBlob]="item.blob" />
        </mat-tab>
        }
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end"> </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteMapDialogComponent implements OnInit {
  private processService = inject(ProcessService);
  private pdfservice = inject(PdfService);
  private data: data = inject(MAT_DIALOG_DATA);

  isLoading = signal(true);
  pdfBlobList = signal<pdfBlobItem[]>([]);

  ngOnInit(): void {
    this.getWorkflow();
  }

  getWorkflow() {
    this.isLoading.set(true);
    this.processService
      .getWorkflow(this.data.procedure._id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        map((data) => {
          return this.data.communicationId
            ? [resolveWorkflowPathTo(this.data.communicationId, data)]
            : resolveWorkflowPaths(data);
        }),
        switchMap((paths) =>
          forkJoin(
            paths.map(({ path, isOriginal, title }) =>
              this.pdfservice
                .testRouteMaop(this.data.procedure, path, isOriginal)
                .pipe(map((blob) => ({ title, blob })))
            )
          )
        )
      )
      .subscribe((data) => {
        this.pdfBlobList.set(data);
      });
  }

  // flujo observable
  // forkJoin(
  //           data.map((item) =>
  //             this.pdfservice
  //               .testRouteMaop(this.data.procedure, item.path, item.isOriginal)
  //               .pipe(
  //                 map((blob) => ({
  //                   title: item.title,
  //                   blob,
  //                 }))
  //               )
  //           )
  //         )
}
