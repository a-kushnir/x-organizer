import {AbstractControl, ValidationErrors, Validator} from '@angular/forms';

export class ConfirmationValidator implements Validator {
  constructor(private field: string,
              private name: string) {
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value1 = control.value;
    const value2 = control.parent ? control.parent.get(this.field).value : null;
    return value1 === value2 ? null : {confirmation: {fieldName: this.name}};
  }
}
