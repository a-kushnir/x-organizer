import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'month',
  pure: false
})
export class MonthPipe implements PipeTransform {
  transform(m: moment.Moment, format = 'MMMM YYYY'): string {
    return m.format(format);
  }
}
