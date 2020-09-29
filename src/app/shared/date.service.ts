import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {Session} from './session';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  month: BehaviorSubject<moment.Moment>;
  date: BehaviorSubject<moment.Moment>;
  hasTasks: BehaviorSubject<boolean>;

  constructor() {
    const now = moment();

    this.month = new BehaviorSubject<moment.Moment>(
      Session.getDate('month') ?? now.clone().startOf('month')
    );
    this.month.subscribe(month => {
      Session.setDate('month', month);
    });

    this.date = new BehaviorSubject<moment.Moment>(
      Session.getDate('date') ?? now.clone().startOf('day')
    );
    this.date.subscribe(date => {
      Session.setDate('date', date);
    });

    this.hasTasks = new BehaviorSubject<boolean>(null);
  }

  setDate(date: moment.Moment): void {
    this.date.next(date);
    this.hasTasks.next(null);
  }

  addMonths(amount: number): void {
    const value = this.month.value.add(amount, 'month');
    this.month.next(value);
    this.hasTasks.next(null);
  }
}
