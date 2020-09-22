import { Component, OnInit } from '@angular/core';
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateService } from '../shared/date.service';
import { TasksService, Task } from '../shared/tasks.service';
import { switchMap } from 'rxjs/operators';
import {debugOutputAstAsTypeScript} from '@angular/compiler';

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss']
})
export class OrganizerComponent implements OnInit {
  readonly faTrash = faTrash;
  readonly faPlusCircle = faPlusCircle;

  form: FormGroup;
  tasks: Task[] = [];

  constructor(public dateService: DateService,
              public tasksService: TasksService) {
    dateService.date.subscribe(this.getNotes.bind(this));
  }

  ngOnInit(): void {
    this.dateService.date.pipe(
      switchMap(value => this.tasksService.load(value))
    ).subscribe(tasks => {
      this.tasks = tasks;
    });

    this.form = new FormGroup({
      note: new FormControl('', Validators.required)
    });
  }

  remove(task: Task): void {
  }

  submit(): void {
    const {note} = this.form.value;

    const task: Task = {
      note,
      date: this.dateService.date.value.format('YYYY-MM-DD')
    };

    this.tasksService.create(task).subscribe(newTask => {
      this.form.reset();
    }, err => console.error(err));
  }

  getNotes(): void {
    const date = this.dateService.date;
  }
}
