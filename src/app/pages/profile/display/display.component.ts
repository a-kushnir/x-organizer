import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../shared/user.service';
import {Pages, PageService} from '../../../shared/page.service';
import {ProfileService} from '../../../shared/profile.service';

@Component({
  selector: 'app-profile-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {
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
          theme: new FormControl(user.theme, Validators.required)
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
    const {theme} = this.form.value;
    const user = {...this.userService.user.value, theme};

    this.submitted = true;
    this.userService.update(user).then(_ => {
      this.submitted = false;

      this.userService.user.next(user);
      this.pageService.page.next(Pages.Home);
      this.profileService.theme.next(user.theme);
    }).catch(error => {
      this.submitted = false;
      console.error(error);
    });
  }
}
