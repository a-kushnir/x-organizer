import {BrowserModule} from '@angular/platform-browser';
import {Injector, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {HttpClientModule} from '@angular/common/http';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireModule} from '@angular/fire';
export let AppInjector: Injector;

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {HeaderComponent} from './shared/layout/header/header.component';
import {NavigationComponent} from './shared/layout/navigation/navigation.component';
import {FooterComponent} from './shared/layout/footer/footer.component';
import {CalendarComponent} from './pages/home/calendar/calendar.component';
import {OrganizerComponent} from './pages/home/organizer/organizer.component';
import {SelectorComponent} from './pages/home/selector/selector.component';
import {MonthPipe} from './shared/month.pipe';
import {LinkifyPipe} from './shared/linkify.pipe';
import {InputErrorComponent} from './shared/components/input-error/input-error.component';

import {HomeComponent} from './pages/home/home.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {SignInComponent} from './pages/sign-in/sign-in.component';
import {SignUpComponent} from './pages/sign-up/sign-up.component';
import {AccountComponent} from './pages/profile/account/account.component';
import {PasswordComponent} from './pages/profile/password/password.component';
import {DisplayComponent} from './pages/profile/display/display.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavigationComponent,
    FooterComponent,
    CalendarComponent,
    OrganizerComponent,
    SelectorComponent,
    MonthPipe,
    LinkifyPipe,
    HomeComponent,
    ProfileComponent,
    SignInComponent,
    SignUpComponent,
    AccountComponent,
    PasswordComponent,
    DisplayComponent,
    InputErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule
  ],
  providers: [AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
