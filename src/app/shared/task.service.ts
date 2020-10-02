import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {UserService} from './user.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

export interface Day {
  tasks: boolean;
  done: boolean;
}

export interface Task {
  id?: string;
  date?: moment.Moment;
  note: string;
  deleted?: boolean;
  done?: boolean;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  static DB_DATE_FORMAT = 'YYYY-MM-DD';

  constructor(private firestore: AngularFirestore,
              private userService: UserService) {
  }

  all(date: moment.Moment): Promise<Task[]> {
    return this.tasks(date)
      .get()
      .pipe(map(records => {
        const result: Task[] = [];
        records.forEach(record => {
          result.push({...record.data(), id: record.id, date} as Task);
        });
        return result;
      }))
      .toPromise();
  }

  create(task: Task): Promise<Task> {
    const {date, ...attributes} = task;
    return this.tasks(task.date)
      .add(attributes)
      .then(record => {
        return {...task, id: record.id};
      });
  }

  update(task: Task): Promise<void> {
    const {id, date, selected, ...attributes} = task;
    return this.tasks(task.date)
      .doc(task.id)
      .set(attributes);
  }

  remove(task: Task): Promise<void> {
    return this.tasks(task.date)
      .doc(task.id)
      .delete();
  }

  hasTasks(): Promise<object> {
    return this.calendar()
      .get()
      .pipe(map(records => {
        const result = {};
        records.forEach(record => {
          result[record.id] = record.data().tasks ? 'tasks' : 'done';
        });
        return result;
      }))
      .toPromise();
  }

  updateCalendar(date: moment.Moment, tasks: Task[]): Promise<any> {
    const day: Day = {tasks: false, done: false};
    tasks.forEach(task => {
      if (task.done) {
        day.done = true;
      } else {
        day.tasks = true;
      }
    });

    if (day.tasks || day.done) {
      return this.calendar()
        .doc(this.to_db_date(date))
        .set(day);
    } else {
      return this.calendar()
        .doc(this.to_db_date(date))
        .delete();
    }
  }

  private calendar(): AngularFirestoreCollection<Task> {
    const user = this.userService.user.value;
    return this.firestore
      .collection('users')
      .doc(user.id)
      .collection('calendar');
  }

  private tasks(date: moment.Moment): AngularFirestoreCollection<Task> {
    return this.calendar()
      .doc(this.to_db_date(date))
      .collection('tasks');
  }

  to_db_date(date: moment.Moment): string {
    return date.format(TaskService.DB_DATE_FORMAT);
  }
}
