import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PostService } from '../../services/post.service';
import { publication } from '../../../infrastructure/interfaces/publications.interface';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from './create-post/create-post.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-manage-publications',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './manage-publications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ManagePublicationsComponent implements OnInit {
  private publicationService = inject(PostService);
  readonly dialogRef = inject(MatDialog);

  datasource = signal<publication[]>([]);
  displayedColumns: string[] = ['title', 'priority', 'options'];
  length = signal<number>(0);
  ngOnInit(): void {
    this.getPublications();
  }

  getPublications() {
    this.publicationService
      .findByUser()
      .subscribe(({ publications, length }) => {
        this.datasource.set(publications);
        this.length.set(length);
      });
  }

  create(): void {
    const dialogRef = this.dialogRef.open(CreatePostComponent, {
      minWidth: '700px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.datasource.update((values) => [result, ...values]);
    });
  }

  update(publication: publication): void {
    console.log(publication);
    const dialogRef = this.dialogRef.open(CreatePostComponent, {
      minWidth: '800px',
      data: publication,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result: publication) => {
      if (!result) return;
      this.datasource.update((values) => {
        const index = values.findIndex((el) => el._id === result._id);
        values[index] = result;
        return [...values];
      });
    });
  }
}
