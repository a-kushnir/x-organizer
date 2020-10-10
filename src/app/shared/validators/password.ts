import {AbstractControl, ValidationErrors, Validator} from '@angular/forms';
import {UserService} from '../user.service';
import {PasswordService} from '../password.service';
import {AppInjector} from '../../app.module';

export class PasswordValidator implements Validator {
  private userService: UserService;

  constructor() {
    this.userService = AppInjector.get(UserService);
  }

  static create(): (control: AbstractControl) => ValidationErrors|null {
    const validator = new PasswordValidator();
    return validator.validate.bind(validator);
  }

  validate(control: AbstractControl): ValidationErrors|null {
    const value = control.value;
    const user = this.userService.user.value;
    const valid = new PasswordService().compare(value, user.password);
    return valid ? null : {password: true};
  }
}
