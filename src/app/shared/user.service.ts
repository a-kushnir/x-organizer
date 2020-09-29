import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {Session} from './session';

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
  page: BehaviorSubject<string>;

  constructor(private http: HttpClient) {
    this.user = new BehaviorSubject<User>(
      Session.getObject('user')
    );
    this.user.subscribe(user => {
      Session.setObject('user', user);
    });

    this.page = new BehaviorSubject<string>(
      Session.getString('page')
    );
    this.page.subscribe(page => {
      Session.setString('page', page);
    });
  }

  create(user: User): Observable<User> {
    return this.http
      .post<CreateResponse>(`${UserService.BASE_URL}/${this.encode(user.email)}.json`, user)
      .pipe(map(response => {
        return {...user, id: response.name};
      }));
  }

  load(user: User): Observable<User> {
    return this.http
      .get<User[]>(`${UserService.BASE_URL}/${this.encode(user.email)}.json`)
      .pipe(map(users => {
        if (!users) {
          return null;
        }
        return Object.keys(users).map(key => ({...users[key], id: key}))[0];
      }));
  }

  update(user: User): Observable<void> {
    const {name, email, password, theme} = user; // DELETE ID
    const obj = {name, email, password, theme};
    return this.http
      .patch<void>(`${UserService.BASE_URL}/${this.encode(user.email)}/${this.encode(user.id)}.json`, obj);
  }

  encode(value: string): string {
    return encodeURIComponent(value.replace(/\./gi, '&'));
  }
}
