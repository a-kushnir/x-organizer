import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from 'src/app/shared/user.service';
import {Pages, PageService} from 'src/app/shared/page.service';
import {PasswordService} from 'src/app/shared/password.service';
import {DateService} from 'src/app/shared/date.service';
import {FormComponent} from 'src/app/shared/components/form/form.component';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent extends FormComponent implements OnInit {

  constructor(private userService: UserService,
              private pageService: PageService,
              private dateService: DateService) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit(): void {
    const {email, password} = this.form.value;

    this.userService.findByEmail(email).then(user => {
      this.submitted = false;

      if (user && new PasswordService().compare(password, user.password)) {
        this.userService.user.next(user);
        this.pageService.page.next(Pages.Home);
        this.dateService.reset();
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
}
