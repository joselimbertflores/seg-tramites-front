import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  confirmDialogData,
  DescriptionDialogComponent,
} from '../../shared';
import { Observable } from 'rxjs';

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

interface ToastOptions {
  seconds?: number;
  title: string;
  message?: string;
  onActionRouteNavigate?: string;
}

interface SnackbarOptions {
  message: string;
  duration?: number;
  action?: string;
}

interface dialogProps {
  title: string;
  description: string;
}
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private toast = inject(ToastrService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  Alert({ icon = 'info', title, text }: AlertOptions) {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonText: 'Aceptar',
    });
  }

  confirmDialog(data: confirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: data,
        disableClose: true,
      })
      .afterClosed();
  }

  descriptionDialog(data: dialogProps): Observable<string | null> {
    return this.dialog
      .open(DescriptionDialogComponent, {
        data: data,
        disableClose: true,
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

  LoadingAlert(title: string, subtitle: string): void {
    Swal.fire({
      title: title,
      text: subtitle,
      allowOutsideClick: false,
    });
    Swal.showLoading();
  }

  CloseLoadingAlert(): void {
    Swal.close();
  }

  Toast({ seconds = 5000, title, message }: ToastOptions) {
    this.toast.info(message, title, {
      positionClass: 'toast-bottom-right',
      closeButton: true,
      timeOut: seconds,
    });
  }

  Snackbar({ message, duration = 3000, action }: SnackbarOptions) {
    return this.snackBar.open(message, action, { duration });
  }

  SuccesToast({ seconds = 5000, title, message }: ToastOptions) {
    this.toast.success(message, title, {
      positionClass: 'toast-bottom-right',
      closeButton: true,
      timeOut: seconds,
    });
  }
}
