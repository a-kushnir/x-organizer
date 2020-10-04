import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserService} from './user.service';
import * as firebase from 'firebase';
import FieldPath = firebase.firestore.FieldPath;
import {RealTimeUpdate} from './real-time-update';
import {DateService} from './date.service';
import {User} from './models/user.model';

export enum Statuses {
  Active = 'Active',
  Done = 'Done',
}

class RTUKey {
  user: User;
  month: moment.Moment;
}

@Injectable({
  providedIn: 'root'
})
export class DayStatusService {
  static DB_DATE_FORMAT = 'YYYY-MM-DD';
  static DB_MONTH_FORMAT = 'YYYY-MM';

  days: BehaviorSubject<object>;
  private rtu: RealTimeUpdate;

  constructor(private firestore: AngularFirestore,
              private dateService: DateService,
              private userService: UserService) {

    this.days = new BehaviorSubject<object>({});
    this.rtu = new RealTimeUpdate(this.listenForUpdates.bind(this), this.handleUpdates.bind(this));

    this.dateService.month.subscribe(month => {
      const user = this.userService.user.value;
      if (user) {
        this.rtu.subscribe({user, month} as RTUKey);
      }
    });
    this.userService.user.subscribe(user => {
      if (!user) {
        this.rtu.unsubscribe();
      }
    });
  }

  private listenForUpdates(key: RTUKey): any {
    const {user, month} = key;
    const months = [
      month.clone().add(-1, 'month').format(DayStatusService.DB_MONTH_FORMAT),
      month.format(DayStatusService.DB_MONTH_FORMAT),
      month.clone().add(1, 'month').format(DayStatusService.DB_MONTH_FORMAT)
    ];
    return this.firestore
      .collection('users')
      .doc(user.id)
      .collection('months', ref => ref
        .where(FieldPath.documentId(), 'in', months)
      )
      .valueChanges({idField: 'id'});
  }

  private handleUpdates(key: RTUKey, records: any): void {
    const {month} = key;
    const months = [
      month.clone().add(-1, 'month').format('YYYY-MM'),
      month.format('YYYY-MM'),
      month.clone().add(1, 'month').format('YYYY-MM')
    ];
    const days = {};
    months.forEach(mon => {
      days[mon] = {};
    });
    records.forEach(record => {
      const {id, ...data} = record;
      days[id] = data;
    });
    this.days.next(days);
  }

  update(date: moment.Moment, status?: Statuses): void {
    const doc = this.firestore
      .collection('users')
      .doc(this.userService.user.value.id)
      .collection('months')
      .doc(date.format(DayStatusService.DB_MONTH_FORMAT));

    doc.get().subscribe(record => {
        let data = {};
        if (record.exists) {
          data = record.data();
        }

        const key = date.format(DayStatusService.DB_DATE_FORMAT);
        if (status) {
          data[key] = status;
        } else {
          delete data[key];
        }

        const hasData = Object.keys(data).length > 0;
        if (record.exists && !hasData) {
          doc.delete().catch(error => console.error(error));
        } else if (hasData) {
          doc.set(data).catch(error => console.error(error));
        }
      });
  }
}
