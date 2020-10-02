import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DateService } from '../../../shared/date.service';
import {TaskService} from '../../../shared/task.service';
import {switchMap} from 'rxjs/operators';

class Day {
  date: moment.Moment;
  active: boolean;
  selected: boolean;
  disabled: boolean;
  weekend: boolean;
  mark: string;
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
              public tasksService: TaskService) {
    dateService.month.subscribe(this.generateCalendar.bind(this));
    dateService.date.subscribe(this.generateCalendar.bind(this));
    dateService.hasTasks.subscribe(this.reloadCalendar.bind(this));
  }

  ngOnInit(): void {
    this.dateService.month.pipe(
      switchMap(_ => this.tasksService.hasTasks())
    ).subscribe(hasTasks => {
      this.hasTasks = hasTasks;
      this.generateCalendar();
    });
  }

  reloadCalendar(): void {
    this.ngOnInit();
    this.generateCalendar();
  }

  generateCalendar(): void {
    const today = moment();
    const month = this.dateService.month.value;
    const startDate = month.clone().startOf('month').startOf('week');
    const endDate = month.clone().endOf('month').endOf('week');
    let hasTasksNext = null;

    this.weeks = [];

    const current = startDate.clone().subtract(1, 'day');
    while (current.isBefore(endDate, 'day')) {
      this.weeks.push({
        days: Array(7).fill(0).map(() => {
          const date = current.add(1, 'day').clone();
          const active = current.isSame(today, 'day');
          const selected = current.isSame(this.dateService.date.value, 'day');
          const disabled = !current.isSame(month, 'month');
          const weekend = current.day() === 0 || current.day() === 6;
          const mark = this.hasTasks[current.format('YYYY-MM-DD')];

          if (selected) {
            hasTasksNext = mark;
          }

          return { date, active, selected, disabled, weekend, mark };
        })
      });
    }

    if (hasTasksNext !== this.dateService.hasTasks.value) {
      this.dateService.hasTasks.next(hasTasksNext);
    }
  }

  selectDate(value): void {
    this.dateService.setDate(value.date);
  }
}
