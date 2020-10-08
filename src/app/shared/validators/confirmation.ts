import {AbstractControl, ValidatorFn} from '@angular/forms';

export function confirmationValidator(field: string, name: string): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {

    const value1 = control.value;
    const value2 = control.parent ? control.parent.get(field).value : null;

    return value1 !== value2 ? {confirmation: {fieldName: name}} : null;
  };
}
