import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {UserService} from './user.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Task} from '../models/task.model';
import {RealTimeUpdate} from '../real-time-update';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from '../models/user.model';
import {DateService} from './date.service';
import {dbDate, dbDateTime} from '../date-format';
import _ from 'lodash';
import {map} from 'rxjs/operators';

class RTUKey {
  user: User;
  date: moment.Moment;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  tasks: BehaviorSubject<Task[]>;
  private rtu: RealTimeUpdate;

  constructor(private firestore: AngularFirestore,
              private dateService: DateService,
              private userService: UserService) {

    this.tasks = new BehaviorSubject<Task[]>([]);
    this.rtu = new RealTimeUpdate(this.listenForUpdates.bind(this), this.handleUpdates.bind(this));

    this.dateService.date.subscribe(date => {
      const user = this.userService.user.value;
      if (user) {
        this.rtu.subscribe({user, date} as RTUKey);
      }
    });
    this.userService.user.subscribe(user => {
      if (!user) {
        this.rtu.unsubscribe();
      }
    });
  }

  static sort(tasks: Task[]): void {
    tasks.sort((a, b) => {
      if (a.completedAt && (!b.completedAt || a.completedAt < b.completedAt)) {
        return 1;
      } else if (b.completedAt && (!a.completedAt || b.completedAt < a.completedAt)) {
        return -1;
      } else if (a.sortOrder && b.sortOrder) {
        return a.sortOrder > b.sortOrder ? 1 : -1;
      } else if (a.sortOrder && !b.sortOrder) {
        return 1;
      } else if (b.sortOrder && !a.sortOrder) {
        return -1;
      } else if (a.createdAt && b.createdAt) {
        return a.createdAt > b.createdAt ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  private calendarCollection(user?: User): AngularFirestoreCollection<Task> {
    user = user ?? this.userService.user.value;
    return this.firestore
      .collection('users')
      .doc(user.id)
      .collection('calendar');
  }

  private tasksCollection(date: moment.Moment, user?: User): AngularFirestoreCollection<Task> {
    return this.calendarCollection(user)
      .doc(dbDate(date))
      .collection('tasks');
  }

  private listenForUpdates(key: RTUKey): Observable<any> {
    const {user, date} = key;
    return this
      .tasksCollection(date, user)
      .valueChanges({idField: 'id'});
  }

  private handleUpdates(key: RTUKey, records: any): void {
    const {date} = key;
    records.forEach(record => {
      record.date = date;
      // Conversion
      if (!record.createdAt) {
        record.createdAt = dbDateTime(moment().startOf('month'));
      }
      if (record.done && !record.completedAt) {
        record.completedAt = dbDateTime(moment().startOf('day'));
      }
      delete record.done;
    });
    TaskService.sort(records);
    if (!_.isEqual(this.tasks.value, records)) {
      this.tasks.next(records);
    }
  }

  findByDate(date: moment.Moment): Promise<Task[]> {
    return this.tasksCollection(date)
      .get()
      .pipe(map(records => {
        return records.docs.map((record) => {
          return {...record.data(), id: record.id} as Task;
        });
      })).toPromise();
  }

  create(task: Task): Promise<Task> {
    const {date, ...attributes} = task;
    return this.tasksCollection(task.date)
      .add(attributes)
      .then(record => {
        return {...task, id: record.id};
      });
  }

  update(task: Task): Promise<void> {
    const {id, date, ...attributes} = task;
    return this.tasksCollection(date)
      .doc(id)
      .set(attributes);
  }

  updateAll(tasks: Task[]): Promise<void> {
    const batch = this.firestore.firestore.batch();

    tasks.forEach(task => {
      const {id, date, ...attributes} = task;
      const ref = this.tasksCollection(date).doc(id).ref;
      batch.set(ref, attributes as Task);
    });

    return batch.commit();
  }

  delete(task: Task): Promise<void> {
    return this.tasksCollection(task.date)
      .doc(task.id)
      .delete();
  }

}
