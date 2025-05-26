import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { PdfService, PdfDisplayComponent } from '../../../../shared';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { forkJoin, from, Observable, of } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
interface data {
  procedure: any;
  workflow: any[];
}
@Component({
  selector: 'app-route-map',
  imports: [CommonModule, MatTabsModule, MatDialogModule, PdfDisplayComponent],
  template: `
    <h2 mat-dialog-title>Hoja de Ruta {{ data.procedure.code }}</h2>
    <mat-dialog-content>
      <mat-tab-group>
        @for (item of pdfSrcList(); track $index) {
        <mat-tab [label]="'Documento '">
          <pdf-display [pdfBlob]="item" />
        </mat-tab>
        }
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end"> </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteMapComponent implements OnInit {
  private pdfservice = inject(PdfService);
  data: data = inject(MAT_DIALOG_DATA);
  show = signal(false);
  pdfSrcList = toSignal( from(this.pdfservice.testRouteMaop(this.data.procedure, this.data.workflow)));

  ngOnInit(): void {}
}
