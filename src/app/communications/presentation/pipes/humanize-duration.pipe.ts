import { Pipe, type PipeTransform } from '@angular/core';
import { humanize } from '../../../helpers';

@Pipe({
  name: 'humanizeDuration',
})
export class HumanizeDurationPipe implements PipeTransform {
  transform(miliseconds: number): string {
    return humanize(miliseconds);
  }
}
