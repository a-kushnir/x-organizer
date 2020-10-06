import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../shared/user.service';
import {PasswordService} from '../../shared/password.service';
import {ProfileService} from '../../shared/profile.service';
import {Pages, PageService} from '../../shared/page.service';
import { User } from 'src/app/shared/models/user.model';
import {invalid} from 'src/app/shared/components/input-error/input-error.component';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  invalid = invalid;

  constructor(private userService: UserService,
              private pageService: PageService,
              private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmation: new FormControl('', Validators.required)
    });
  }

  enterSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      return;
    }

    const {name, email, confirmation} = this.form.value;
    let {password} = this.form.value;

    if (password === confirmation) {
      const theme = this.profileService.theme;
      password = new PasswordService().hash(password);
      this.submitted = true;

      this.userService.findByEmail(email).then(existingUser => {
        if (!existingUser) {
          const user: User = {name, email, password, syncTheme: true, theme};
          this.userService.create(user).then(newUser => {
            this.submitted = false;

            this.form.reset();
            this.userService.user.next(newUser);
            this.pageService.page.next(Pages.Home);
          }).catch(error => {
            this.submitted = false;
            console.error(error);
          });
        } else {
          this.submitted = false;
        }
      }).catch(error => {
        this.submitted = false;
        console.error(error);
      });
    }
  }

  switch(): void {
    this.pageService.page.next(Pages.SignIn);
  }
}
