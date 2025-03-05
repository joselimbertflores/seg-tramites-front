import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { BackButtonDirective, SearchInputComponent } from '../../../../shared';
import { ArchiveService } from '../../services';

@Component({
  selector: 'app-archives',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    BackButtonDirective,
    SearchInputComponent,
  ],
  templateUrl: './archives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArchivesComponent implements OnInit {
  private archiveService = inject(ArchiveService);

  datasource = signal<any[]>([]);
  datasize = signal<number>(0);

  readonly displayedColumns: string[] = [
    'code',
    'description',
    'officer',
    'date',
    'options',
  ];

  limit = signal<number>(10);
  index = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');
  isOpen = false;
  folderName = signal<string>('');

  @Input('id') folderId: string;

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    const id = this.folderId === 'no-folder' ? null : this.folderId;
    this.archiveService.findAll(id).subscribe((data) => {
      this.datasource.set(data.archives);
      this.folderName.set(data.folderName);
    });
  }

  search(term: string) {}
}
