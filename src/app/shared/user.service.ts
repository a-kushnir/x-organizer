import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {LocalStorage} from './local-storage';
import {AngularFirestore} from '@angular/fire/firestore';
import {RealTimeUpdate} from './real-time-update';
import {User} from './models/user.model';
import {QueryFn} from '@angular/fire/firestore/interfaces';
import {AngularFirestoreCollection} from '@angular/fire/firestore/collection/collection';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: BehaviorSubject<User>;
  private rtu: RealTimeUpdate;

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

  private collection(queryFn?: QueryFn): AngularFirestoreCollection<any> {
    return this.firestore
      .collection('users', queryFn);
  }

  private valueChanges(id: string): Observable<any> {
    return this
      .collection()
      .doc(id)
      .valueChanges();
  }

  findByEmail(email: string): Promise<User> {
    return this
      .collection(ref => ref
        .where('email', '==', email)
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
    return this
      .collection()
      .add(user)
      .then(record => {
        return {...user, id: record.id};
      });
  }

  update(user: User): Promise<void> {
    const {id, ...record} = user;
    return this
      .collection()
      .doc(id)
      .update(record);
  }
}
