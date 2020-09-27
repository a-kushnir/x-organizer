import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import {UserService} from './user.service';

export interface Task {
  id?: string;
  date?: moment.Moment;
  note: string;
  done?: boolean;
}

interface CreateResponse {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  static BASE_URL = 'https://x-organizer.firebaseio.com/tasks';
  static DB_DATE_FORMAT = 'YYYY-MM-DD';

  constructor(private http: HttpClient,
              private userService: UserService) {
  }

  load(date: moment.Moment): Observable<Task[]> {
    return this.http
      .get<Task[]>(`${this.base_url()}/${this.to_db_date(date)}.json`)
      .pipe(map(tasks => {
        if (!tasks) {
          return [];
        }
        return Object.keys(tasks).map(key => ({...tasks[key], id: key, date}));
      }));
  }

  create(task: Task): Observable<Task> {
    const { note, done } = task;
    return this.http
      .post<CreateResponse>(`${this.base_url()}/${this.to_db_date(task.date)}.json`, { note, done })
      .pipe(map(response => {
        return {...task, id: response.name };
      }));
  }

  update(task: Task): Observable<void> {
    const { note, done } = task;
    return this.http
      .patch<void>(`${this.base_url()}/${this.to_db_date(task.date)}/${task.id}.json`, { note, done });
  }

  remove(task: Task): Observable<void> {
    return this.http
      .delete<void>(`${this.base_url()}/${this.to_db_date(task.date)}/${task.id}.json`);
  }

  hasTasks(): Observable<object> {
    return this.http
      .get<object>(`${this.base_url()}.json?shallow=true`)
      .pipe(map(dates => {
        if (!dates) {
          return {};
        }
        return dates;
      }));
  }

  to_db_date(date: moment.Moment): string {
    return date.format(TasksService.DB_DATE_FORMAT);
  }

  base_url(): string {
    const user = this.userService.user.value;
    return user ? `${TasksService.BASE_URL}/${user.id}` : null;
  }
}
