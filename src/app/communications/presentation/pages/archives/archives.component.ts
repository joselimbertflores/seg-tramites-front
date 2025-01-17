import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ArchiveService } from '../../services';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-archives',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './archives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArchivesComponent implements OnInit {
  private location = inject(Location);
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
    this.archiveService.findAll(this.folderId).subscribe((data) => {
      this.datasource.set(data.archives);
      this.folderName.set(data.folderName);
    });
  }

  back() {
    this.location.back();
  }
}
