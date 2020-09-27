import {Component, OnInit} from '@angular/core';
import {User, UserService} from './shared/user.service';
import {DateService} from './shared/date.service';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User;
  page: string;

  constructor(private userService: UserService,
              private dateService: DateService) {
  }

  ngOnInit(): void {
    this.handlePageRefresh();
    this.userService.user.subscribe(user => {
      this.user = user;
    });
    this.userService.page.subscribe(page => {
      this.page = page;
    });
  }

  private handlePageRefresh(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.userService.user.next(JSON.parse(user));
    }
    this.userService.user.subscribe(value => {
      localStorage.removeItem('user');
      localStorage.setItem('user', JSON.stringify(value));
    });

    const date = localStorage.getItem('date');
    if (date) {
      this.dateService.date.next(moment(date, 'YYYY-MM-DD'));
    }
    this.dateService.date.subscribe(value => {
      localStorage.removeItem('date');
      localStorage.setItem('date', value.format('YYYY-MM-DD'));
    });
  }
}
