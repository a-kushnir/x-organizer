import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../shared/user.service';
import {Pages, PageService} from '../../../shared/page.service';

@Component({
  selector: 'app-profile-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  constructor(private userService: UserService,
              private pageService: PageService) {
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user) {
        this.form = new FormGroup({
          name: new FormControl(user.name, Validators.required),
          email: new FormControl(user.email, Validators.required)
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
    const {name, email} = this.form.value;
    const user = {...this.userService.user.value, name, email};

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
}
