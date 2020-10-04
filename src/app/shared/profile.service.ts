import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserService} from './user.service';
import {LocalStorage} from './local-storage';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  theme: BehaviorSubject<string>;

  constructor(private userService: UserService) {
    this.theme = new BehaviorSubject<string>(
      LocalStorage.getString('theme') ?? 'light'
    );

    this.theme.subscribe(theme => {
      LocalStorage.setString('theme', theme);
    });

    userService.user.subscribe(user => {
      if (user && user.theme !== this.theme.value) {
        const theme = user.theme ?? 'light';
        if (theme !== this.theme.value) {
          this.theme.next(user.theme);
          setTimeout(location.reload.bind(location), 100);
        }
      }
    });
  }
}
