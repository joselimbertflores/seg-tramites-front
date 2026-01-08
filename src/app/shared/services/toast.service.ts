import { Injectable, signal } from '@angular/core';
import { toast } from 'ngx-sonner';

interface ToastConfig {
  title: string;
  description?: string;
  severity?: 'warning' | 'info' | 'success' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  protected readonly toast = toast;

  customToastData = signal<string | null>(null);

  showToast({ title, description, severity, duration = 5000 }: ToastConfig) {
    switch (severity) {
      case 'warning':
        toast.warning(title, { description, closeButton: true, duration });
        break;

      case 'error':
        toast.error(title, { description, closeButton: true, duration });
        break;

      case 'success':
        toast.success(title, { description, closeButton: true, duration });
        break;

      case 'info':
        toast.info(title, { description, closeButton: true, duration });
        break;

      default:
        toast(title, { description, closeButton: true, duration });
        break;
    }
  }
}
