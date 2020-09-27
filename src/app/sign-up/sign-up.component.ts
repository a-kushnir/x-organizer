import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User, UserService} from '../shared/user.service';
import {PasswordService} from '../shared/password.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  form: FormGroup;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      confirmation: new FormControl('', Validators.required)
    });
  }

  submit(): void {
    const {name, email, password, confirmation} = this.form.value;
    if (password === confirmation) {
      const user: User = {name, email, password: new PasswordService().hash(password)};
      this.userService.load(user).subscribe(existingUser => {
        if (!existingUser) {
          this.userService.create(user).subscribe(newUser => {
            this.form.reset();
            this.userService.user.next(newUser);
          }, error => console.error(error));
        }
      }, error => console.error(error));
    }
  }

  switch(): void {
    this.userService.page.next('sign-in');
  }
}
