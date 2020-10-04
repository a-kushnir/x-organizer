import {Injectable} from '@angular/core';
import {UserService} from './user.service';
import {LocalStorage} from './local-storage';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  get theme(): string {
    return LocalStorage.getString('theme') ?? 'light';
  }

  constructor(private userService: UserService) {
    userService.user.subscribe(user => {
      if (user?.theme && user.theme !== this.theme) {
        LocalStorage.setString('theme', user.theme);
        location.reload();
      }
    });
  }
}
