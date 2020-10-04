import {Injectable} from '@angular/core';
import {UserService} from './user.service';
import {LocalStorage} from './local-storage';
import {environment} from '../../environments/environment';
declare var require: any;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private applied: boolean;

  get theme(): string {
    return LocalStorage.getString('theme') ?? 'light';
  }

  constructor(private userService: UserService) {
    this.changeTheme();
    userService.user.subscribe(user => {
      if (user?.theme && user.theme !== this.theme) {
        LocalStorage.setString('theme', user.theme);
        this.changeTheme();
      }
    });
  }

  private changeTheme(): void {
    if (environment.production) {
      // @ts-ignore
      document.getElementById('themeLink').href = `${this.theme}-theme.css`;
    } else {
      if (!this.applied) {
        require(`src/styles/${this.theme}-theme.scss`);
        this.applied = true;
      } else {
        setTimeout(location.reload.bind(location), 100);
      }
    }
  }

}
