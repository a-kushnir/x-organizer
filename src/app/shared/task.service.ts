import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {UserService} from './user.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Task} from './models/task.model';
import {RealTimeUpdate} from './real-time-update';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from './models/user.model';
import {DateService} from './date.service';
import {dbDate} from './date-format';
import _ from 'lodash';

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
    });
    if (!_.isEqual(this.tasks.value, records)) {
      this.tasks.next(records);
    }
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
    return this.tasksCollection(task.date)
      .doc(task.id)
      .set(attributes);
  }

  remove(task: Task): Promise<void> {
    return this.tasksCollection(task.date)
      .doc(task.id)
      .delete();
  }

}
