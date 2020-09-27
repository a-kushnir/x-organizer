import { Component, OnInit } from '@angular/core';
import {User, UserService} from '../shared/user.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  user: User;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      this.user = user;
    });
  }

  sign_out(): void {
    this.userService.user.next(null);
  }
}
