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
      this.tasks = this.tasks.filter(t => t.id !== task.id);
    }, err => console.error(err));
  }

  submit(): void {
    const {note} = this.form.value;

    const task: Task = {
      date: this.dateService.date.value,
      note
    };

    this.tasksService.create(task).subscribe(newTask => {
      this.form.reset();
      this.tasks.push(newTask);
    }, err => console.error(err));
  }
}
