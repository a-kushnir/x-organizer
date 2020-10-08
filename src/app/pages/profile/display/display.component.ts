import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from 'src/app/shared/user.service';
import {PageService} from 'src/app/shared/page.service';
import {ProfileService} from 'src/app/shared/profile.service';
import {FormComponent} from 'src/app/shared/components/form/form.component';

@Component({
  selector: 'app-profile-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent extends FormComponent implements OnInit {

  constructor(private userService: UserService,
              private pageService: PageService,
              private profileService: ProfileService) {
    super();
  }

  ngOnInit(): void {
    this.userService.user.subscribe(user => {
      if (user) {
        this.form = new FormGroup({
          syncTheme: new FormControl(user.syncTheme, Validators.required),
          theme: new FormControl(this.profileService.theme, Validators.required)
        });
      } else {
        this.form = null;
      }
    });
  }

  onSubmit(): void {
    const {syncTheme, theme} = this.form.value;
    const user = {...this.userService.user.value, theme, syncTheme};

    this.userService.update(user).then(_ => {
      this.submitted = false;

      this.userService.user.next(user);
      this.profileService.theme = theme;
    }).catch(error => {
      this.submitted = false;
      console.error(error);
    });
  }
}
