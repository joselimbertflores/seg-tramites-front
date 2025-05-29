import {
  ChangeDetectionStrategy,
  linkedSignal,
  DestroyRef,
  Component,
  inject,
  input,
} from '@angular/core';

import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'pdf-display',
  imports: [SafePipe],
  template: `
    <div class="w-full h-[550px]">
      <iframe [src]="pfdBlobUrl() | safe" class="w-full h-full"></iframe>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfDisplayComponent {
  private detroyRef = inject(DestroyRef);

  pdfBlob = input.required<Blob>();

  pfdBlobUrl = linkedSignal<Blob, string>({
    source: this.pdfBlob,
    computation: (newOptions, previous) => {
      if (previous) {
        URL.revokeObjectURL(previous.value);
      }
      return URL.createObjectURL(newOptions);
    },
  });

  constructor() {
    this.detroyRef.onDestroy(() => {
      URL.revokeObjectURL(this.pfdBlobUrl());
    });
  }
}
