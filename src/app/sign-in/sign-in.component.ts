import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User, UserService} from '../shared/user.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  form: FormGroup;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  submit(): void {
    const {email, password} = this.form.value;
    const user: User = {email, password};
    this.userService.load(user).subscribe(newUser => {
      if (newUser && newUser.password === password) {
        this.userService.user.next(newUser);
        this.form.reset();
      }
    }, error => console.error(error));
  }

  switch(): void {
    this.userService.page.next('sign-up');
  }
}

