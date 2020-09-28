import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import {User} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  month: BehaviorSubject<moment.Moment>;
  date: BehaviorSubject<moment.Moment>;
  hasTasks: BehaviorSubject<boolean>;

  constructor() {
    this.month = new BehaviorSubject<moment.Moment>(DateService.loadMonth());
    this.month.subscribe(month => {
      DateService.saveMonth(month);
    });

    this.date = new BehaviorSubject<moment.Moment>(DateService.loadDate());
    this.date.subscribe(date => {
      DateService.saveDate(date);
    });

    this.hasTasks = new BehaviorSubject<boolean>(null);
  }

  private static loadMonth(): moment.Moment {
    const value = localStorage.getItem('month');
    return value ? moment(value, 'YYYY-MM-DD') : moment().clone().startOf('month');
  }
  private static saveMonth(month: moment.Moment): void {
    localStorage.removeItem('month');
    localStorage.setItem('month', month.format('YYYY-MM-DD'));
  }
  private static loadDate(): moment.Moment {
    const date = localStorage.getItem('date');
    return date ? moment(date, 'YYYY-MM-DD') : moment().clone().startOf('day');
  }
  private static saveDate(date: moment.Moment): void {
    localStorage.removeItem('date');
    localStorage.setItem('date', date.format('YYYY-MM-DD'));
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
