import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {LocalStorage} from './local-storage';
import {AngularFirestore} from '@angular/fire/firestore';

export class User {
  id?: string;
  name?: string;
  email: string;
  password: string;
  theme?: string;
}

interface CreateResponse {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  static BASE_URL = 'https://x-organizer.firebaseio.com/users';

  user: BehaviorSubject<User>;

  constructor(private http: HttpClient,
              private firestore: AngularFirestore) {
    this.user = new BehaviorSubject<User>(
      LocalStorage.getObject('user')
    );
    this.user.subscribe(user => {
      LocalStorage.setObject('user', user);
    });
  }

  create(user: User): Promise<User> {
    return this.firestore
      .collection('users')
      .add(user)
      .then(record => {
        return {...user, id: record.id};
      });
  }

  load(user: User): Promise<User> {
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

  update(user: User): Promise<void> {
    const {id, ...record} = user;
    return this.firestore
      .collection('users')
      .doc(id)
      .update(record);
  }

  encode(value: string): string {
    return encodeURIComponent(value.replace(/\./gi, '&'));
  }
}
