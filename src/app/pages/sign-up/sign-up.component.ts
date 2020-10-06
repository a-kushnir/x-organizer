import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../shared/user.service';
import {PasswordService} from '../../shared/password.service';
import {ProfileService} from '../../shared/profile.service';
import {Pages, PageService} from '../../shared/page.service';
import { User } from 'src/app/shared/models/user.model';
import {retry} from 'rxjs/operators';
import {InputErrorComponent} from '../../shared/components/input-error/input-error.component';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  form: FormGroup;
  submitted = false;

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

  fieldValid(fieldControl: AbstractControl): boolean {
    return InputErrorComponent.fieldValid(fieldControl);
  }

  enterSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  private markFormGroupTouched(form: FormGroup): void {
    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  submit(): void {
    this.markFormGroupTouched(this.form);
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
