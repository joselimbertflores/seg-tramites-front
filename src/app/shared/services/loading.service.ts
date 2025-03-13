import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { LoaderDialogComponent } from '../components/dialogs/loader-dialog/loader-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  constructor() {}

  private isLoading = new BehaviorSubject<boolean>(false);

  isLoading$ = this.isLoading.asObservable();

  private uploadingDialogRef: MatDialogRef<LoaderDialogComponent, void> | null;
  private dialogRef = inject(MatDialog);

  loadingOn() {
    this.isLoading.next(true);
  }

  loadingOff() {
    this.isLoading.next(false);
  }

  uploadingOn(): void {
    if (this.uploadingDialogRef) return;
    this.uploadingDialogRef = this.dialogRef.open(LoaderDialogComponent, {
      disableClose: true,
    });

    this.uploadingDialogRef.afterClosed().subscribe(() => {
      this.uploadingDialogRef = null; // Reset cuando se cierra el diálogo
    });
  }

  uploadingOff(): void {
    this.uploadingDialogRef?.close();
  }
}
