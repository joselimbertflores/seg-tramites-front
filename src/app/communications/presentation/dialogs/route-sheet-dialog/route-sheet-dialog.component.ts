import {
  inject,
  resource,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { firstValueFrom, forkJoin, map, of, switchMap } from 'rxjs';

import { Procedure, procedureGroup } from '../../../../procedures/domain';
import { PdfService, PdfDisplayComponent } from '../../../../shared';
import { getWorkflowPaths, getWorkflowPathTo } from '../../helpers';
import { workflow } from '../../../infrastructure';
import { ProcessService } from '../../services';
import { sendStatus } from '../../../domain';

export interface RouteSheetData {
  requestParams: routeSheetParams;
  preloadedData?: preloadedDataProps;
}

interface routeSheetParams {
  procedure: procedureProps;
  communicationId?: string;
}

interface procedureProps {
  id: string;
  group: procedureGroup;
}

interface preloadedDataProps {
  procedure?: Procedure;
  workflow?: workflow[];
}

interface pdfBlobItem {
  blob: Blob;
  title: string;
  isOriginal:boolean
}

@Component({
  selector: 'app-route-sheet-dialog',
  imports: [
    CommonModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PdfDisplayComponent,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Hoja de Ruta</h2>
    <mat-dialog-content>
      @if(pdfBlobList.isLoading()){
        <div class="flex items-center justify-center h-[500px]">
          <mat-spinner />
        </div>
      } 
      @else if(pdfBlobList.error()) {
        <div class="flex items-center justify-center h-[500px]">
          <div class="flex flex-col text-center text-red-400">
            <p class="font-medium text-xl tracking-wide">
              Error al generar la hoja de ruta
            </p>
            <p>
              Ha ocurrido un error interno por lo que este reporte no esta
              disponible.
            </p>
          </div>
        </div>
      } 
      @else if(pdfBlobList.value()) {
        <mat-tab-group class="test">
          @for (item of pdfBlobList.value(); track $index) {
            <mat-tab [label]="item.title">
              <ng-template mat-tab-label>
                @if(item.isOriginal) {
                <mat-icon class="mr-2" style="color: var(--mat-sys-primary)"> task </mat-icon>
                } @else {
                <mat-icon class="mr-2" style="color: var(--mat-sys-outline)">
                  description
                </mat-icon>
                }
                {{item.title}}
              </ng-template>
              <pdf-display [pdfBlob]="item.blob" />
            </mat-tab>
          }
        </mat-tab-group>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close cdkFocusInitial>Cerrar</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteSheetDialogComponent {
  private pdfservice = inject(PdfService);
  private processService = inject(ProcessService);
  readonly data: RouteSheetData = inject(MAT_DIALOG_DATA);

  pdfBlobList = resource<pdfBlobItem[], RouteSheetData>({
    params: () => this.data,
    loader: ({ params }) => {
      return firstValueFrom(
        this.buildGetDataMethod().pipe(
          map(({ procedure, workflow }) => {
            const filteredWorkflow = workflow.filter(
              ({ status }) =>
                ![
                  sendStatus.Rejected,
                  sendStatus.AutoRejected,
                  sendStatus.Forwarding,
                ].includes(status as sendStatus)
            );
            return {
              procedure,
              paths: params.requestParams.communicationId
                ? [
                    getWorkflowPathTo(
                      params.requestParams.communicationId,
                      filteredWorkflow
                    ),
                  ]
                : getWorkflowPaths(filteredWorkflow),
            };
          }),
          switchMap(({ procedure, paths }) =>
            forkJoin(
              paths.map(({ path, isOriginal, title }) =>
                this.pdfservice
                  .routeSheet(procedure, path, isOriginal)
                  .pipe(map((blob) => ({ title, blob, isOriginal })))
              )
            )
          )
        )
      );
    },
  });

  private buildGetDataMethod() {
    const { requestParams, preloadedData } = this.data;
    return forkJoin({
      procedure: preloadedData?.procedure
        ? of(preloadedData.procedure)
        : this.processService.getProcedure(
            requestParams.procedure.id,
            requestParams.procedure.group
          ),
      workflow: preloadedData?.workflow
        ? of(preloadedData.workflow)
        : this.processService.getWorkflow(requestParams.procedure.id),
    });
  }
}
