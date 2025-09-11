import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface MessageDialogProps {
  title: string;
  description?: string;
  list?: string[];
}
@Component({
  selector: 'app-message-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      @if(data.description){
      <p class="text-lg">{{ data.description }}</p>
      } @if(data.list){
      <ul class="list-disc">
        @for (item of data.list; track $index) {
        <li>{{ item }}</li>
        }
      </ul>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close cdkFocusInitial>Aceptar</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageDialogComponent {
  data = inject<MessageDialogProps>(MAT_DIALOG_DATA);
}
