import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ResourceDialogComponent } from '../../dialogs/resource-dialog/resource-dialog.component';

@Component({
  selector: 'app-resources',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
    CdkAccordionModule,
    MatButtonModule,
  ],
  templateUrl: './resources.component.html',
  styles: `
  .file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.file-actions {
  display: flex;
  gap: 8px;
}
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResourcesComponent {
  private dialogRef = inject(MatDialog);
  expandedIndex = 0;
  files = [
    { fileName: 'Ejemplo1', originalName: 'Ejemplop1' },
    { fileName: 'Ejemplo1', originalName: 'Ejemplop1' },
  ];

  categories = ['Imagenes', 'VIdeos', 'Archivos'];

  create() {
    const dialogRef = this.dialogRef.open(ResourceDialogComponent, {
      minWidth: '700px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      // this.datasource.update((values) => [result, ...values]);
    });
  }
}
