import {Injectable} from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class Session {

  static getString(key: string): string {
    return localStorage.getItem(key);
  }

  static setString(key: string, value: string): void {
    localStorage.removeItem(key);
    localStorage.setItem(key, value);
  }

  static getObject(key: string): any {
    const value = this.getString(key);
    return JSON.parse(value);
  }

  static setObject(key: string, value: object): void {
    this.setString(key, JSON.stringify(value));
  }

  static getDate(key: string): moment.Moment {
    const value = this.getString(key);
    return value ? moment(value, 'YYYY-MM-DD') : null;
  }

  static setDate(key: string, value: moment.Moment): void {
    this.setString(key, value ? value.format('YYYY-MM-DD') : null);
  }

}
