import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { forkJoin, of, switchMap } from 'rxjs';

import { PostService } from '../../../services/post.service';
import {
  FileUploadService,
  FileUploaderComponent,
  SecureImageUploaderComponent,
} from '../../../../../shared';
import { attachmentFile } from '../../../../domain';

interface uploadedFiles {
  attachments: attachmentFile[];
  image: string | null;
}
@Component({
  selector: 'app-publication-dialog',
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
    FileUploaderComponent,
    SecureImageUploaderComponent,
  ],
  templateUrl: './publication-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export class PublicationDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private postService = inject(PostService);
  private fileUploadService = inject(FileUploadService);
  private readonly dialogRef = inject(MatDialogRef<PublicationDialogComponent>);

  readonly minDate = new Date();
  readonly prioritys = [
    { value: 0, label: 'Baja' },
    { value: 1, label: 'Media' },
    { value: 2, label: 'Alta' },
  ];
  data?: any = inject(MAT_DIALOG_DATA);
  files = signal<File[]>([]);
  image = signal<File | null>(null);
  form = this.formBuilder.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    priority: [0, Validators.required],
    startDate: [this.minDate, Validators.required],
    expirationDate: [this.minDate, Validators.required],
  });

  uploadedFiles = signal<uploadedFiles>({
    attachments: [],
    image: null,
  });

  ngOnInit(): void {
    this.loadFormData();
  }

  readonly EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf'];

  save() {
    if (this.form.invalid) return;
    const subscription = this.buildFileUploadTask().pipe(
      switchMap(([image, ...attachments]) =>
        this.buildSaveMethod(image?.fileName ?? null, attachments)
      )
    );
    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }
  
  private loadFormData() {
    if (!this.data) return;
    const { image, attachments, ...props } = this.data;
    this.form.patchValue(props);
    this.uploadedFiles.set({ attachments: [...attachments], image });
  }

  private buildFileUploadTask() {
    return forkJoin([
      this.image()
        ? this.fileUploadService.uploadFile(this.image()!, 'post')
        : of(null),
      ...this.files().map((file) =>
        this.fileUploadService.uploadFile(file, 'post')
      ),
    ]);
  }

  private buildSaveMethod(
    newImage: string | null,
    newAttachments: attachmentFile[]
  ) {
    if (!this.data) {
      return this.postService.create(this.form.value, newImage, newAttachments);
    }
    // * If image is null, send uploaded file
    return this.postService.update({
      id: this.data._id,
      form: this.form.value,
      image: newImage ?? this.uploadedFiles().image?.split('/').pop() ?? null,
      attachments: [
        ...this.uploadedFiles().attachments.map((item) => ({
          fileName: item.fileName.split('/').pop()!,
          originalName: item.originalName,
        })),
        ...newAttachments,
      ],
    });
  }
}
