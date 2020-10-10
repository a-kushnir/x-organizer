import * as moment from 'moment';

export function dbDateTime(date: moment.Moment = moment()): string {
  return date?.format('YYYY-MM-DD hh:mm:ss.SSS');
}

export function dbDate(date: moment.Moment = moment()): string {
  return date?.format('YYYY-MM-DD');
}

export function dbMonth(date: moment.Moment = moment()): string {
  return date?.format('YYYY-MM');
}
