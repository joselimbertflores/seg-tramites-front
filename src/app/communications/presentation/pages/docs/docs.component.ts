import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DocDialogComponent } from './doc-dialog/doc-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-docs',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocsComponent {
  private dialogRef = inject(MatDialog);

  create() {
    const dialogRef = this.dialogRef.open(DocDialogComponent, {
      maxWidth: '1000px',
      width: '1000px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      // if (!result) return;
      // this.datasize.update((value) => (value += 1));
      // this.datasource.update((values) => {
      //   if (values.length === this.limit()) values.pop();
      //   return [result, ...values];
      // });
      // this.send(result);
    });
  }
}
