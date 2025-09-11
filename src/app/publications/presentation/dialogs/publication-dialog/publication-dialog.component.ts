import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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
import { MatInputModule } from '@angular/material/input';

import {
  FileUploaderComponent,
  SecureImageUploaderComponent,
} from '../../../../shared';
import { PublicationAttachment, publication } from '../../../infrastructure';
import { PublicationService } from '../../services/publication.service';

interface PublicacionFiles {
  attachments: PublicationAttachment[];
  image: string | null;
}

@Component({
  selector: 'app-news-dialog',
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    FileUploaderComponent,
    SecureImageUploaderComponent,
  ],
  templateUrl: './publication-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export class PublicationDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private postService = inject(PublicationService);
  private readonly dialogRef = inject(MatDialogRef);
  readonly minDate = new Date();
  readonly prioritys = [
    { value: 0, label: 'Baja' },
    { value: 1, label: 'Media' },
    { value: 2, label: 'Alta' },
  ];
  data: publication | undefined = inject(MAT_DIALOG_DATA);
  files = signal<File[]>([]);
  image = signal<File | null>(null);
  form: FormGroup = this.formBuilder.group({
    title: [''],
    content: [''],
    priority: [0, Validators.required],
    startDate: [this.minDate, Validators.required],
    expirationDate: [this.minDate, Validators.required],
  });

  uploadedFiles = signal<PublicacionFiles>({
    attachments: [],
    image: null,
  });

  ngOnInit(): void {
    this.loadFormData();
  }

  readonly EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf'];

  save() {
    if (this.form.invalid) return;

    const subscription = this.data
      ? this.postService.update({
          id: this.data._id,
          form: this.form.value,
          currentFiles: this.uploadedFiles().attachments,
          currentImage: this.uploadedFiles().image,
          newFiles: this.files(),
          newImage: this.image(),
        })
      : this.postService.create(this.form.value, this.image(), this.files());

    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  private loadFormData() {
    if (!this.data) return;

    const { image, attachments, ...props } = this.data;

    this.form.patchValue(props);

    this.uploadedFiles.set({ attachments, image });
  }
}
