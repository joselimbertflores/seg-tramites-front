import type { AbstractControl } from '@angular/forms';

const ERROR_MESSAGES = {
  required: () => 'Este campo es requerido',
  minlength: (min: number) => `Ingrese al menos ${min} caracteres`,
  maxlength: (max: number) => `Solo ${max} caracteres`,
};
export const handleFormErrorMessages = (control: AbstractControl) => {
  if (control.hasError('required')) return 'Este campo es requerido';
  if (control.hasError('pattern')) return 'Campo invalido';
  if (control.hasError('minlength')) {
    const minLengthRequired = control.getError('minlength').requiredLength;
    return `Ingrese al menos ${minLengthRequired} caracteres`;
  }
  if (control.hasError('maxlength')) {
    const maxLengthRequired = control.getError('maxlength').requiredLength;
    return `Solo ${maxLengthRequired} caracteres`;
  }
  return '';
};
