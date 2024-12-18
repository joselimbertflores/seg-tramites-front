import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-doc-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './doc-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocDialogComponent {
  private _formBuilder = inject(FormBuilder);

  readonly types = [
    { value: 'CI', label: 'Comunicacion Internoa' },
    { value: 'CE', label: 'Comunicacion Externa' },
    { value: 'CIR', label: 'Circular' },
    { value: 'MEM', label: 'Memorandum' },
  ];

  formDoc = this._formBuilder.group({
    type: ['', Validators.required],
    reference: ['', Validators.required],
    sender: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
    recipient: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
    via: this._formBuilder.group({
      fullname: ['', Validators.required],
      jobtitle: ['', Validators.required],
    }),
  });
}
