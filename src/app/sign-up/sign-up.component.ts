import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {User, UserService} from '../shared/user.service';
import {PasswordService} from '../shared/password.service';
import {ProfileService} from '../shared/profile.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(private userService: UserService,
              private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      confirmation: new FormControl('', Validators.required)
    });
  }

  enterSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  submit(): void {
    const {name, email, confirmation} = this.form.value;
    let {password} = this.form.value;

    if (password === confirmation) {
      const theme = this.profileService.theme.value;
      password = new PasswordService().hash(password);
      const user: User = {name, email, password, theme};
      this.submitted = true;

      this.userService.load(user).subscribe(existingUser => {
        if (!existingUser) {
          this.userService.create(user).subscribe(newUser => {
            this.submitted = false;

            this.form.reset();
            this.userService.user.next(newUser);
            this.userService.page.next('sign-in');
          }, error => {
            this.submitted = false;
            console.error(error);
          });
        } else {
          this.submitted = false;
        }
      }, error => {
        this.submitted = false;
        console.error(error);
      });
    }
  }

  switch(): void {
    this.userService.page.next('sign-in');
  }
}
