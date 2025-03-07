import { Pipe, type PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

const ERROR_MESSAGES: Record<string, string> = {
  unknown: 'This field has an error',
  required: 'Este campo es requeiro',
};
@Pipe({
  name: 'formErrorMessages',
})
export class FormErrorMessagesPipe implements PipeTransform {
  transform(errors: ValidationErrors | null | undefined): string {
    console.log(errors);
    if (!errors) return '';
    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) {
      return `Ingrese al menos ${errors['minlength'].requiredLength} caracteres`;
    }
    return 'Este campo no es valido';
  }
}
