import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {LocalStorage} from './local-storage';

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
      LocalStorage.getDate('month') ?? now.clone().startOf('month')
    );
    this.month.subscribe(month => {
      LocalStorage.setDate('month', month);
    });

    this.date = new BehaviorSubject<moment.Moment>(
      LocalStorage.getDate('date') ?? now.clone().startOf('day')
    );
    this.date.subscribe(date => {
      LocalStorage.setDate('date', date);
    });

    this.hasTasks = new BehaviorSubject<boolean>(null);
  }

  reset(): void {
    const now = moment();
    this.month.next(now.clone().startOf('month'));
    this.date.next(now.clone().startOf('day'));
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
