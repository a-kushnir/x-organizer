import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';

export interface Task {
  id?: string;
  date?: moment.Moment;
  note: string;
}

interface CreateResponse {
  name: string;
}

@Injectable({providedIn: 'root'})
export class TasksService {
  static url = 'https://x-organizer.firebaseio.com/tasks';

  constructor(private http: HttpClient) {
  }

  load(date: moment.Moment): Observable<Task[]> {
    return this.http
      .get<Task[]>(`${TasksService.url}/${this.db_date(date)}.json`)
      .pipe(map(tasks => {
        if (!tasks) {
          return [];
        }
        return Object.keys(tasks).map(key => ({...tasks[key], id: key, date}));
      }));
  }

  create(task: Task): Observable<Task> {
    const { note } = task;
    return this.http
      .post<CreateResponse>(`${TasksService.url}/${this.db_date(task.date)}.json`, { note })
      .pipe(map(response => {
        return {...task, id: response.name };
      }));
  }

  remove(task: Task): Observable<void> {
    return this.http
      .delete<void>(`${TasksService.url}/${this.db_date(task.date)}/${task.id}.json`);
  }

  db_date(date: moment.Moment): string {
    return date.format('YYYY-MM-DD');
  }
}
