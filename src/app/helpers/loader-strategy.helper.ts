import { HttpContext } from '@angular/common/http';
import {
  LOAD_INDICATOR,
  UPLOAD_INDICATOR,
} from '../core/interceptors/interceptor';

export function skipLoadIndicator() {
  return new HttpContext().set(LOAD_INDICATOR, false);
}

export function skipUploadIndicator() {
  return new HttpContext().set(UPLOAD_INDICATOR, false);
}
