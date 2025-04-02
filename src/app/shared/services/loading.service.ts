import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';

import { LoaderDialogComponent } from '../components/dialogs/loader-dialog/loader-dialog.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private dialogRef = inject(MatDialog);
  private uploadingDialogRef: MatDialogRef<LoaderDialogComponent, void> | null;
  private totalRequests = 0;
  private _isLoading = new BehaviorSubject<boolean>(false);

  isLoading = toSignal(this._isLoading);

  toggleLoading(show: boolean) {
    if (show) {
      this.totalRequests++;
      this._isLoading.next(true);
    } else {
      this.totalRequests--;
      if (this.totalRequests === 0) {
        this._isLoading.next(false);
      }
    }
  }

  toggleUploading(show: boolean): void {
    if (show) {
      if (this.uploadingDialogRef) return;
      this.uploadingDialogRef = this.dialogRef.open(LoaderDialogComponent, {
        disableClose: true,
      });
      this.uploadingDialogRef.afterClosed().subscribe(() => {
        this.uploadingDialogRef = null;
      });
    } else {
      this.uploadingDialogRef?.close();
    }
  }
}
