import {ConfirmationValidator} from './confirmation';

export class MyValidators {
  static confirmation = (field: string, name: string) => {
    const validator = new ConfirmationValidator(field, name);
    return validator.validate.bind(validator);
  }
}
