import {Component, OnInit} from '@angular/core';
import {User, UserService} from './shared/user.service';
import {DateService} from './shared/date.service';
import {ProfileService} from './shared/profile.service';
import {Pages, PageService} from './shared/page.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User;
  page: Pages;
  pages = Pages;
  theme: string;

  constructor(private userService: UserService,
              private pageService: PageService,
              private dateService: DateService,
              private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      this.user = user;
    });
    this.pageService.page.subscribe(page => {
      this.page = page;
    });
    this.profileService.theme.subscribe(theme => {
      this.theme = theme;
    });
  }
}
