import * as moment from 'moment';

export interface Task {
  id?: string;
  date?: moment.Moment;
  note: string;
  deleted?: boolean;
  done?: boolean;
}
