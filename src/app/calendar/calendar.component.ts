import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DateService } from '../shared/date.service';

class Day {
  date: moment.Moment;
  active: boolean;
  selected: boolean;
  disabled: boolean;
}

class Week {
  days: Day[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  weeks: Week[];
  date: moment.Moment;

  constructor(private dateService: DateService) {
    dateService.date.subscribe(this.generateCalendar.bind(this));
  }

  ngOnInit(): void {
  }

  generateCalendar(value): void {
    const today = moment();
    const startDate = value.clone().startOf('month').startOf('week');
    const endDate = value.clone().endOf('month').endOf('week');

    this.weeks = [];

    const current = startDate.clone().subtract(1, 'day');
    while (current.isBefore(endDate, 'day')) {
      this.weeks.push({
        days: Array(7).fill(0).map(() => {
          const date = current.add(1, 'day').clone();
          const active = current.isSame(today, 'day');
          const selected = active;
          const disabled = !current.isSame(value, 'month');

          return {
            date, active, selected, disabled
          };
        })
      });
    }

    console.log(this.weeks);
  }

  selectDate(value): void {
    this.weeks.forEach((week) => {
      week.days.forEach((day) => {
        day.selected = day === value;
      });
    });
    this.date = value.date;
  }
}
