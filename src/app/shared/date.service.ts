import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  public month: BehaviorSubject<moment.Moment>;
  public date: BehaviorSubject<moment.Moment>;

  constructor() {
    const now = moment();
    this.month = new BehaviorSubject<moment.Moment>(now.clone().startOf('month'));
    this.date = new BehaviorSubject<moment.Moment>(now.clone().startOf('day'));
  }

  setDate(date: moment.Moment): void {
    this.date.next(date);
  }

  addMonths(amount: number): void {
    const value = this.month.value.add(amount, 'month');
    this.month.next(value);
  }
}
