import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User, UserService} from '../shared/user.service';
import {PasswordService} from '../shared/password.service';

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
      if (newUser && new PasswordService().compare(password, newUser.password)) {
        this.updateProfile(newUser);
        this.userService.user.next(newUser);
        this.form.reset();
      }
    }, error => console.error(error));
  }

  switch(): void {
    this.userService.page.next('sign-up');
  }

  private updateProfile(user: User): void {
    if (!user.theme) {
      user.theme = 'light';
      this.userService.update(user).subscribe(_ => {
        }, error => console.error(error));
    }
  }
}
