import { Injectable, inject } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import {
  confirmDialogData,
  ConfirmDialogComponent,
  LoaderDialogComponent,
  DescriptionDialogComponent,
  descriptionDialogProps,
  MessageDialogComponent,
  messageDialogProps,
} from '..';
import { toast } from 'ngx-sonner';

interface AlertOptions {
  title: string;
  text?: string;
  icon: 'success' | 'error' | 'warning' | 'info' | 'question';
}

interface QuestionAlertOptions {
  title: string;
  text?: string;
  callback: () => void;
}

interface ConfirmAlertOptions {
  title: string;
  text?: string;
  callback: (result: string) => void;
}

interface toastOptions {
  seconds?: number;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface SnackbarOptions {
  message: string;
  duration?: number;
  action?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private toast = inject(ToastrService);
  private snackBar = inject(MatSnackBar);

  private dialogRef = inject(MatDialog);

  Alert({ icon = 'info', title, text }: AlertOptions) {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonText: 'Aceptar',
    });
  }

  confirmDialog(data: confirmDialogData): Observable<boolean> {
    return this.dialogRef
      .open(ConfirmDialogComponent, {
        data: data,
        disableClose: true,
      })
      .afterClosed();
  }

  descriptionDialog(data: descriptionDialogProps): Observable<string | null> {
    return this.dialogRef
      .open(DescriptionDialogComponent, {
        data: data,
        disableClose: true,
        width: '800px',
      })
      .afterClosed();
  }

  messageDialog(data: messageDialogProps): Observable<void> {
    return this.dialogRef
      .open(MessageDialogComponent, {
        data: data,
        width: '800px',
      })
      .afterClosed();
  }

  QuestionAlert({ title, text, callback }: QuestionAlertOptions) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  }

  ConfirmAlert({ title, text, callback }: ConfirmAlertOptions) {
    Swal.fire({
      icon: 'question',
      title: title,
      text: text,
      input: 'textarea',
      inputPlaceholder: 'Ingrese una descripcion',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      customClass: {
        validationMessage: 'my-validation-message',
      },
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage(
            '<i class="fa fa-info-circle"></i> La descripcion es obligatoria'
          );
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        callback(result.value);
      }
    });
  }

  showToast({
    seconds = 5000,
    type = 'info',
    message,
    title,
  }: toastOptions): void {
    const config: Partial<IndividualConfig> = {
      positionClass: 'toast-bottom-right',
      closeButton: true,
      timeOut: seconds,
      progressBar: true,
    };
    this.toast[type](message, title, config);
    // toast.loading('Warning')
  }

  Snackbar({ message, duration = 3000, action }: SnackbarOptions) {
    return this.snackBar.open(message, action, { duration });
  }
}
