import {ConfirmationValidator} from './confirmation';
import {UniquenessValidator} from './uniqueness';

export class MyValidators {
  static confirmation = ConfirmationValidator.create;
  static uniqueness = UniquenessValidator.create;
}
