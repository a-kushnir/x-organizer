import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from 'src/app/shared/user.service';
import {Pages, PageService} from 'src/app/shared/page.service';
import {PasswordService} from 'src/app/shared/password.service';
import {User} from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(private userService: UserService,
              private pageService: PageService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  enterSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  submit(): void {
    const {email, password} = this.form.value;
    this.submitted = true;

    this.userService.findByEmail(email).then(newUser => {
      this.submitted = false;

      if (newUser && new PasswordService().compare(password, newUser.password)) {
        this.updateProfile(newUser);
        this.userService.user.next(newUser);
        this.pageService.page.next(Pages.Home);
        this.form.reset();
      }
    }).catch(error => {
      this.submitted = false;
      console.error(error);
    });
  }

  switch(): void {
    this.pageService.page.next(Pages.SignUp);
  }

  private updateProfile(user: User): void {
    if (!user.theme) {
      user.theme = 'light';
      this.userService.update(user).then(_ => {
        }).catch(error => console.error(error));
    }
  }
}
