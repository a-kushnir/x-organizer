import {Component, OnInit} from '@angular/core';
import {User, UserService} from '../shared/user.service';
import {ProfileService} from '../shared/profile.service';
import {Pages, PageService} from '../shared/page.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  user: User;
  theme: string;

  constructor(private userService: UserService,
              private pageService: PageService,
              private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      this.user = user;
    });
    this.profileService.theme.subscribe(theme => {
      this.theme = theme;
    });
  }

  switchTheme(): void {
    this.profileService.switchTheme();
  }

  sign_out(): void {
    this.userService.user.next(null);
    this.pageService.page.next(Pages.SignIn);
  }
}
