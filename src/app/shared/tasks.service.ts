import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';

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

  constructor(private http: HttpClient) {
  }

  load(date: moment.Moment): Observable<Task[]> {
    return this.http
      .get<Task[]>(`${TasksService.BASE_URL}/${this.to_db_date(date)}.json`)
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
      .post<CreateResponse>(`${TasksService.BASE_URL}/${this.to_db_date(task.date)}.json`, { note, done })
      .pipe(map(response => {
        return {...task, id: response.name };
      }));
  }

  update(task: Task): Observable<void> {
    const { note, done } = task;
    return this.http
      .patch<void>(`${TasksService.BASE_URL}/${this.to_db_date(task.date)}/${task.id}.json`, { note, done });
  }

  remove(task: Task): Observable<void> {
    return this.http
      .delete<void>(`${TasksService.BASE_URL}/${this.to_db_date(task.date)}/${task.id}.json`);
  }

  hasTasks(): Observable<object> {
    return this.http
      .get<object>(`${TasksService.BASE_URL}.json?shallow=true`)
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
}
