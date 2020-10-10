import * as moment from 'moment';

export interface Task {
  id?: string;
  date?: moment.Moment;
  note: string;
  created_at: string;
  completed_at?: string;
  deleted?: boolean;
  done?: boolean;
}
