import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CustomFormValidators {
  static matchFields(field: string, confirmField: string): ValidatorFn | null {
    return (formGroup: AbstractControl) => {
      const control1 = formGroup.get(field);
      const control2 = formGroup.get(confirmField);

      if (!control1 || !control2) return null;

      const currentErrors = control2.errors;

      if (compare(control1.value, control2.value)) {
        control2.setErrors({ ...currentErrors, not_match: true });
        return null; // Aplica el error al FormGroup también
      } else {
        control2?.setErrors(currentErrors);
      }
      return null;
    };
  }
}

function compare(field: string, confirmField: string) {
  return field !== confirmField && confirmField !== '';
}
