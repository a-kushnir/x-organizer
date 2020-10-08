import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from 'src/app/shared/user.service';
import {Pages, PageService} from 'src/app/shared/page.service';
import {FormComponent} from 'src/app/shared/components/form/form.component';

@Component({
  selector: 'app-profile-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent extends FormComponent implements OnInit {

  constructor(private userService: UserService,
              private pageService: PageService) {
    super();
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user) {
        this.form = new FormGroup({
          name: new FormControl(user.name, [Validators.required, Validators.maxLength(50)]),
          email: new FormControl(user.email, [Validators.required, Validators.maxLength(255), Validators.email])
        });
      } else {
        this.form = null;
      }
    });
  }

  onSubmit(): void {
    const {name, email} = this.form.value;
    const user = {...this.userService.user.value, name, email};

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
