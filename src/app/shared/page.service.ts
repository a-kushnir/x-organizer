import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {LocalStorage} from './local-storage';

export enum Pages {
  Home = 'Home',
  SignIn = 'SignIn',
  SignUp = 'SignUp',
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  page: BehaviorSubject<Pages>;

  constructor() {
    this.page = new BehaviorSubject<Pages>(
      Pages[LocalStorage.getString('page') ?? Pages.SignIn]
    );
    this.page.subscribe(page => {
      LocalStorage.setString('page', page);
    });
  }
}
