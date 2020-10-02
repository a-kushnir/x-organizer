import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User, UserService} from '../../../shared/user.service';

@Component({
  selector: 'app-profile-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user) {
        this.form = new FormGroup({
          theme: new FormControl('', Validators.required)
        });
      } else {
        this.form = null;
      }
    });
  }

  enterSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  submit(): void {
  }
}
