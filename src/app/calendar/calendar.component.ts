import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DateService } from '../shared/date.service';
import {TasksService} from '../shared/tasks.service';
import {switchMap} from 'rxjs/operators';

class Day {
  date: moment.Moment;
  active: boolean;
  selected: boolean;
  disabled: boolean;
  hasTasks: boolean;
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
  hasTasks: object = {};

  constructor(private dateService: DateService,
              public tasksService: TasksService) {
    dateService.month.subscribe(this.generateCalendar.bind(this));
    dateService.date.subscribe(this.generateCalendar.bind(this));
  }

  ngOnInit(): void {
    this.dateService.month.pipe(
      switchMap(_ => this.tasksService.hasTasks())
    ).subscribe(hasTasks => {
      this.hasTasks = hasTasks;
      this.generateCalendar();
    });
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
          const hasTasks = this.hasTasks[current.format('YYYY-MM-DD')];

          return {
            date, active, selected, disabled, hasTasks
          };
        })
      });
    }
  }

  selectDate(value): void {
    this.dateService.setDate(value.date);
  }
}
