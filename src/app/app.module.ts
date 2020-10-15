import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireModule} from '@angular/fire';
import {SortablejsModule} from 'ngx-sortablejs';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {HeaderComponent} from './shared/layout/header/header.component';
import {NavigationComponent} from './shared/layout/navigation/navigation.component';
import {FooterComponent} from './shared/layout/footer/footer.component';
import {InputErrorComponent} from './shared/components/input-error/input-error.component';
import {CalendarComponent} from './pages/home/calendar/calendar.component';
import {OrganizerComponent} from './pages/home/organizer/organizer.component';
import {SelectorComponent} from './pages/home/selector/selector.component';
import {MomentPipe} from './shared/moment.pipe';
import {LinkifyPipe} from './shared/linkify.pipe';

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
    InputErrorComponent,
    CalendarComponent,
    OrganizerComponent,
    SelectorComponent,
    MomentPipe,
    LinkifyPipe,
    HomeComponent,
    ProfileComponent,
    SignInComponent,
    SignUpComponent,
    AccountComponent,
    PasswordComponent,
    DisplayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    SortablejsModule.forRoot({animation: 150}),
  ],
  providers: [AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule {}
