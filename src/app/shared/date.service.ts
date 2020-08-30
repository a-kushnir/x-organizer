import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  public date: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());

  addMonths(amount: number): void {
    const value = this.date.value.add(amount, 'month');
    this.date.next(value);
  }
}
