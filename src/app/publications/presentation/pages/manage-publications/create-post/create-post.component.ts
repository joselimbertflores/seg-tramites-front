import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { forkJoin, switchMap } from 'rxjs';

import { PostService } from '../../../services/post.service';

@Component({
    selector: 'app-create-post',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatListModule,
        MatRadioModule,
        MatDatepickerModule,
    ],
    templateUrl: './create-post.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideNativeDateAdapter()]
})
export class CreatePostComponent {
  private formBuilder = inject(FormBuilder);
  private postService = inject(PostService);
  private readonly dialogRef = inject(MatDialogRef<CreatePostComponent>);

  readonly minDate = new Date();
  readonly prioritys = [
    { value: 0, label: 'Baja' },
    { value: 1, label: 'Media' },
    { value: 2, label: 'Alta' },
  ];

  files = signal<File[]>([]);
  image = signal<File | undefined>(undefined);
  form = this.formBuilder.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    priority: [0, Validators.required],
    expirationDate: [this.minDate, Validators.required],
  });

  create() {
    if (this.form.invalid) return;
    const subscription =
      this.files().length > 0
        ? forkJoin([
            ...this.files().map((file) => this.postService.uploadFile(file)),
          ]).pipe(
            switchMap((resp) => this.postService.create(this.form.value, resp))
          )
        : this.postService.create(this.form.value, []);

    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  selectImage(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.image.set(inputElement.files?.[0]);
  }

  addFile(event: Event): void {
    const files = this._onInputFileSelect(event);
    if (!files) return;
    this.files.update((values) => [...files, ...values]);
  }

  removeFile(index: number) {
    this.files.update((values) => {
      values.splice(index, 1);
      return [...values];
    });
  }

  private _onInputFileSelect(event: Event): File[] {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files || inputElement.files.length === 0) return [];
    const list = inputElement.files;
    const files: File[] = [];
    for (let i = 0; i < list.length; i++) {
      files.push(list[i]);
    }
    return files;
  }
}
