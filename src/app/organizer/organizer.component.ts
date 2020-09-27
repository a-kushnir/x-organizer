import { Component, OnInit } from '@angular/core';
import { faEdit, faTrash, faPlusCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
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
  readonly faEdit = faEdit;
  readonly faTrash = faTrash;
  readonly faPlusCircle = faPlusCircle;
  readonly faCheck = faCheck;
  readonly faTimes = faTimes;

  formNew: FormGroup;
  formEdit: FormGroup;
  tasks: Task[] = [];
  editTask: Task = null;

  constructor(public dateService: DateService,
              public tasksService: TasksService) {
  }

  ngOnInit(): void {
    this.dateService.date.pipe(
      switchMap(value => this.tasksService.load(value))
    ).subscribe(tasks => {
      this.tasks = tasks;
      this.editTask = null;
    });

    this.formNew = new FormGroup({
      note: new FormControl('', Validators.required)
    });
    this.formEdit = new FormGroup({
      note: new FormControl('', Validators.required)
    });
  }

  toggle(task: Task): void {
    task.done = !task.done;
    this.save(task);
  }

  edit(task: Task): void {
    this.editTask = task;
    this.formEdit.reset();
    if (task) {
      this.formEdit.setValue({note: task.note});
    }
  }

  update(task: Task): void {
    const {note} = this.formEdit.value;
    task.note = note;
    this.save(task);
    this.edit(null);
  }

  create(): void {
    const {note} = this.formNew.value;

    const task: Task = {
      date: this.dateService.date.value,
      note
    };

    this.tasksService.create(task).subscribe(newTask => {
      this.formNew.reset();
      this.tasks.push(newTask);

      if (this.tasks.length === 1) {
        this.dateService.hasTasks.next(true);
      }
    }, error => console.error(error));
  }

  remove(task: Task): void {
    this.tasksService.remove(task).subscribe(_ => {
      this.tasks = this.tasks.filter(t => t.id !== task.id);

      if (this.tasks.length === 0) {
        this.dateService.hasTasks.next(false);
      }
    }, error => console.error(error));
  }

  private save(task: Task): void {
    this.tasksService.update(task).subscribe(_ => {
    }, error => console.error(error));
  }
}
