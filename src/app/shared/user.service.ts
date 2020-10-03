import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {LocalStorage} from './local-storage';
import {AngularFirestore} from '@angular/fire/firestore';
import {RealTimeUpdate} from './real-time-update';

export class User {
  id?: string;
  name?: string;
  email: string;
  password: string;
  theme?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: BehaviorSubject<User>;
  rtu: RealTimeUpdate;

  constructor(private firestore: AngularFirestore) {
    this.rtu = new RealTimeUpdate((key) => {
      return this.valueChanges(key);
    }, (value) => {
      value = {...value, id: this.rtu.key};
      this.user.next(value);
    });

    this.user = new BehaviorSubject<User>(
      LocalStorage.getObject('user')
    );

    this.user.subscribe(user => {
      LocalStorage.setObject('user', user);
      this.rtu.subscribe(user?.id);
    });
  }

  valueChanges(id: string): any {
    return this.firestore
      .collection('users')
      .doc(id)
      .valueChanges();
  }

  first(user: User): Promise<User> {
    return this.firestore
      .collection('users', ref => ref
        .where('email', '==', user.email)
        .limit(1))
      .get()
      .pipe(map(records => {
        if (records.size === 1) {
          const record = records.docs[0];
          return {...record.data(), id: record.id} as User;
        }
        return null;
      }))
      .toPromise();
  }

  create(user: User): Promise<User> {
    return this.firestore
      .collection('users')
      .add(user)
      .then(record => {
        return {...user, id: record.id};
      });
  }

  update(user: User): Promise<void> {
    const {id, ...record} = user;
    return this.firestore
      .collection('users')
      .doc(id)
      .update(record);
  }
}
