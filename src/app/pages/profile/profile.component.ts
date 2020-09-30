import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PasswordService} from '../../shared/password.service';
import {User, UserService} from '../../shared/user.service';
import {Pages, PageService} from '../../shared/page.service';
import {ProfileService} from '../../shared/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(private userService: UserService,
              private pageService: PageService,
              private profileService: ProfileService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user) {
        this.form = new FormGroup({
          name: new FormControl(user.name, Validators.required),
          email: new FormControl(user.email, Validators.required),
          old_password: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required),
          confirmation: new FormControl('', Validators.required),
          theme: new FormControl('', Validators.required),
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

  submit(): void {
    const {name, email} = this.form.value;
    const password = this.password();
    const theme = this.profileService.theme.value;
    const {id} = this.userService.user.value;
    const user: User = {id, name, email, password, theme};

    this.submitted = true;
    this.userService.update(user).subscribe(_ => {
      this.submitted = false;

      this.userService.user.next(user);
      this.pageService.page.next(Pages.Home);
    }, error => {
      this.submitted = false;
      console.error(error);
    });
  }
}
