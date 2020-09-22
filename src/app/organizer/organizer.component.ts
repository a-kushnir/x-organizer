import { Component, OnInit } from '@angular/core';
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateService } from '../shared/date.service';
import { TasksService, Task } from '../shared/tasks.service';
import { switchMap } from 'rxjs/operators';

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
    this.tasksService.remove(task).subscribe(_ => {
      this.reload();
    }, err => console.error(err));
  }

  submit(): void {
    const {note} = this.form.value;

    const task: Task = {
      note,
      date: this.dateService.date.value.format('YYYY-MM-DD')
    };

    this.tasksService.create(task).subscribe(_ => {
      this.form.reset();
      this.reload();
    }, err => console.error(err));
  }

  reload(): void {
    this.tasksService.load(this.dateService.date.value).pipe(
      switchMap(value => this.tasksService.load(this.dateService.date.value))
    ).subscribe(tasks => {
      this.tasks = tasks;
    });
  }
}
