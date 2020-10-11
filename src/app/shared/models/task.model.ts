import * as moment from 'moment';

export interface Task {
  id?: string;
  date?: moment.Moment;
  note: string;
  createdAt: string;
  completedAt?: string;
  deleted?: boolean;
  done?: boolean; // todo remove
  sortOrder?: number;
}
