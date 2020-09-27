import { Component, OnInit } from '@angular/core';
import { User, UserService } from './shared/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'x-organizer';
  user: User;
  page: string;

  constructor(public userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      this.user = user;
    });
    this.userService.page.subscribe(page => {
      this.page = page;
    });
  }
}
