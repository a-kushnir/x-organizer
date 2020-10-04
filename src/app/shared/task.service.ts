import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {UserService} from './user.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Task} from './models/task.model';

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
