import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'stateLabel',
  standalone: true,
})
export class StateLabelPipe implements PipeTransform {
  transform(value: any): string {
    return ' this.validStatus[value]';
  }
}
