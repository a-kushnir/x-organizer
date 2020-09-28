import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  theme: BehaviorSubject<string>;

  constructor(private userService: UserService) {
    this.theme = new BehaviorSubject<string>(ProfileService.loadTheme());

    this.theme.subscribe(theme => {
      ProfileService.saveTheme(this.theme.value);
    });

    userService.user.subscribe(user => {
      if (user && user.theme !== this.theme.value) {
        this.theme.next(user.theme);
      }
    });
  }

  private static loadTheme(): string {
    const theme = localStorage.getItem('theme');
    return theme ?? 'light';
  }
  private static saveTheme(theme: string): void {
    localStorage.removeItem('theme');
    localStorage.setItem('theme', theme);
  }

  switchTheme(): void {
    const theme = this.theme.value === 'light' ? 'dark' : 'light';
    const user = this.userService.user.value;

    if (user && user.theme !== theme) {
      user.theme = theme;

      this.userService.update(user).subscribe(_ => {
      }, error => console.error(error));
      this.userService.user.next(user);
    }

    this.theme.next(theme);
  }
}
