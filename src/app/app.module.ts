import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { CalendarComponent } from './calendar/calendar.component';
import { OrganizerComponent } from './organizer/organizer.component';
import { SelectorComponent } from './selector/selector.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MonthPipe } from './shared/month.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    NavigationComponent,
    CalendarComponent,
    OrganizerComponent,
    SelectorComponent,
    MonthPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
