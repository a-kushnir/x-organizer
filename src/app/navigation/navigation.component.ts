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
  page: Pages;
  pages = Pages;
  theme: string;

  constructor(private userService: UserService,
              private pageService: PageService,
              private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      this.user = user;
    });
    this.pageService.page.subscribe(page => {
      this.page = page;
      if (!this.user && (this.page !== Pages.SignIn && this.page !== Pages.SignUp)) {
        this.pageService.page.next(Pages.SignIn);
      }
    });
    this.profileService.theme.subscribe(theme => {
      this.theme = theme;
    });
  }

  open(page: Pages): void {
    this.pageService.page.next(page);
  }

  sign_out(): void {
    this.userService.user.next(null);
    this.open(Pages.SignIn);
  }
}
