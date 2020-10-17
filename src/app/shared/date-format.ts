import * as moment from 'moment';

const timeFormat = 'HH:mm:ss.SSS';
const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
const dateFormat = 'YYYY-MM-DD';
const monthFormat = 'YYYY-MM';

export function dbTime(date: moment.Moment = moment()): string {
  return date?.format(timeFormat);
}

export function toTime(date: string): moment.Moment {
  return date ? moment(date, timeFormat) : null;
}

export function dbDateTime(date: moment.Moment = moment()): string {
  return date?.format(dateTimeFormat);
}

export function toDateTime(date: string): moment.Moment {
  return date ? moment(date, dateTimeFormat) : null;
}

export function dbDate(date: moment.Moment = moment()): string {
  return date?.format(dateFormat);
}

export function toDate(date: string): moment.Moment {
  return date ? moment(date, dateFormat) : null;
}

export function dbMonth(date: moment.Moment = moment()): string {
  return date?.format(monthFormat);
}

export function toMonth(date: string): moment.Moment {
  return date ? moment(date, monthFormat) : null;
}
