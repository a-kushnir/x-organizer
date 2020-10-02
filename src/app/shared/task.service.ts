import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {UserService} from './user.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

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
  static BASE_URL = 'https://x-organizer.firebaseio.com/tasks';
  static DB_DATE_FORMAT = 'YYYY-MM-DD';

  constructor(private http: HttpClient,
              private firestore: AngularFirestore,
              private userService: UserService) {
  }

  all(date: moment.Moment): Promise<Task[]> {
    return this.tasks(date)
      .get()
      .pipe(map(records => {
        const result: Task[] = [];
        records.forEach(record => {
          result.push({...record.data(), id: record.id, date} as Task)
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

  hasTasks(): Observable<object> {
    return this.http
      .get<object>(`${this.base_url()}.json?shallow=true`)
      .pipe(map(dates => {
        if (!dates) {
          return {};
        }
        return dates;
      }));
  }

  private tasks(date: moment.Moment): AngularFirestoreCollection<Task> {
    return this.firestore
      .collection('users')
      .doc(this.userService.user.value.id)
      .collection('calendar')
      .doc(this.to_db_date(date))
      .collection('tasks');
  }

  to_db_date(date: moment.Moment): string {
    return date.format(TaskService.DB_DATE_FORMAT);
  }

  base_url(): string {
    const user = this.userService.user.value;
    return user ? `${TaskService.BASE_URL}/${user.id}` : null;
  }
}
