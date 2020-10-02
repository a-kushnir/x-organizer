import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../shared/user.service';
import {Pages, PageService} from '../../../shared/page.service';
import {PasswordService} from '../../../shared/password.service';

@Component({
  selector: 'app-profile-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(private userService: UserService,
              private pageService: PageService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user) {
        this.form = new FormGroup({
          old_password: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required),
          confirmation: new FormControl('', Validators.required)
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
    const password = this.password();
    const user = {...this.userService.user.value, password};

    this.submitted = true;
    this.userService.update(user).then(_ => {
      this.submitted = false;

      this.userService.user.next(user);
      this.pageService.page.next(Pages.Home);
    }).catch(error => {
      this.submitted = false;
      console.error(error);
    });
  }

  private password(): string {
    const user = this.userService.user.value;
    const {old_password, password, confirmation} = this.form.value;

    if (old_password.trim() !== '' && password.trim() !== '' && confirmation.trim() !== '') {
      if (new PasswordService().compare(old_password, user.password)) {
        return new PasswordService().hash(password);
      }
    }
    return user.password;
  }
}
