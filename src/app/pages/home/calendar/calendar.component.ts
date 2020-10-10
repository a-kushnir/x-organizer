import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {DateService} from 'src/app/shared/date.service';
import {TaskService} from 'src/app/shared/task.service';
import {DayStatusService} from 'src/app/shared/day-status.service';
import {AutoUnsubscribe} from 'src/app/shared/auto-unsubscribe';

class Day {
  date: moment.Moment;
  active: boolean;
  selected: boolean;
  disabled: boolean;
  weekend: boolean;
  status: string;
}

class Week {
  days: Day[];
}

@AutoUnsubscribe
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  weeks: Week[];

  private $month: Subscription;
  private $date: Subscription;
  private $days: Subscription;

  constructor(private dateService: DateService,
              private tasksService: TaskService,
              private dayStatusService: DayStatusService) {
  }

  ngOnInit(): void {
    this.$month = this.dateService.month.subscribe(this.generateCalendar.bind(this));
    this.$date = this.dateService.date.subscribe(this.generateCalendar.bind(this));
    this.$days = this.dayStatusService.days.subscribe(this.generateCalendar.bind(this));
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
          const weekend = current.day() === 0 || current.day() === 6;
          const statuses = this.dayStatusService.days.value[current.format('YYYY-MM')];
          const status = statuses ? statuses[current.format('YYYY-MM-DD')] : null;
          return { date, active, selected, disabled, weekend, status };
        })
      });
    }
  }

  selectDate(value): void {
    this.dateService.setDate(value.date);
  }
}
