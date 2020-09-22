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

  constructor(private dateService: DateService) {
    dateService.month.subscribe(this.generateCalendar.bind(this));
    dateService.date.subscribe(this.generateCalendar.bind(this));
  }

  ngOnInit(): void {
  }

  generateCalendar(): void {
    const today = moment();
    const month = this.dateService.month.value;
    const startDate = month.clone().startOf('month').startOf('week');
    const endDate = month.clone().endOf('month').endOf('week');

    this.weeks = [];

    const current = startDate.clone().subtract(1, 'day');
    while (current.isBefore(endDate, 'day')) {
      this.weeks.push({
        days: Array(7).fill(0).map(() => {
          const date = current.add(1, 'day').clone();
          const active = current.isSame(today, 'day');
          const selected = current.isSame(this.dateService.date.value, 'day');
          const disabled = !current.isSame(month, 'month');

          return {
            date, active, selected, disabled
          };
        })
      });
    }
  }

  selectDate(value): void {
    this.dateService.setDate(value.date);
  }
}
