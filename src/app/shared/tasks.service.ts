import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as moment from 'moment';

export interface Task {
  id?: string;
  date?: string;
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
      .get<Task[]>(`${TasksService.url}/${date.format('YYYY-MM-DD')}.json`)
      .pipe(map(tasks => {
        if (!tasks) {
          return [];
        }
        return Object.keys(tasks).map(key => ({...tasks[key], id: key}));
      }));
  }

  create(task: Task): Observable<Task> {
    return this.http
      .post<CreateResponse>(`${TasksService.url}/${task.date}.json`, task)
      .pipe(map(response => {
        return {...task, id: response.name };
      }));
  }

  remove(task: Task): void {
  }
}
