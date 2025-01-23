import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { DocDialogComponent } from './doc-dialog/doc-dialog.component';
import { DocService } from '../../services';
import { WordGeneratorService } from '../../../../shared';

@Component({
  selector: 'app-docs',
  imports: [MatButtonModule, MatIconModule, MatTableModule, MatMenuModule],
  templateUrl: './docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocsComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private docService = inject(DocService);
  private wordGeneratorService = inject(WordGeneratorService);

  datasource = signal<any[]>([]);

  displayedColumns: string[] = [
    'cite',
    'reference',
    'sender',
    'procedure',
    'options',
  ];

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

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.docService.findAll().subscribe(({ documents, length }) => {
      this.datasource.set(documents);
      console.log(documents);
    });
  }

  generateTemplate() {
    this.wordGeneratorService.generateDocument();
  }
}
