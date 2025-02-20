import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');

export class DateFormat {
  static formatRemainingHours(remainingTimeMs: number): string {
    return moment.duration(remainingTimeMs, 'hours').humanize();
  }
}
