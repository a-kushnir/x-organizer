import { Component, OnInit } from '@angular/core';
import { faEdit, faTrash, faPlusCircle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateService } from '../../../shared/date.service';
import { TasksService, Task } from '../../../shared/tasks.service';
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
              private tasksService: TasksService) {
  }

  ngOnInit(): void {
    this.dateService.date.pipe(
      switchMap(value => this.tasksService.load(value))
    ).subscribe(tasks => {
      this.clean_deleted(this.tasks);
      this.tasks = this.clean_deleted(tasks);
      this.editTask = null;
    });

    this.formNew = new FormGroup({
      note: new FormControl('', Validators.required)
    });
    this.formEdit = new FormGroup({
      note: new FormControl('', Validators.required)
    });
  }

  create(): void {
    const {note} = this.formNew.value;

    if (!note || note.trim() === '') {
      return;
    }

    const task: Task = {
      date: this.dateService.date.value,
      note
    };

    this.tasksService.create(task).subscribe(newTask => {
      if (!this.hasTasks()) {
        this.dateService.hasTasks.next(true);
      }

      this.formNew.reset();
      this.tasks.push(newTask);
    }, error => console.error(error));
  }

  edit(event: Event, task: Task): void {
    event.stopPropagation();
    this.editTask = task;
    this.formEdit.reset();
    if (task) {
      this.formEdit.setValue({note: task.note});
    }
  }

  toggleDone(task: Task): void {
    task.done = !task.done;
    this.save(task);
  }

  toggleSelect(task: Task): void {
    task.selected = !task.selected;
  }

  update(event: Event, task: Task): void {
    event.stopPropagation();
    const {note} = this.formEdit.value;

    if (!note || note.trim() === '') {
      return;
    }

    task.note = note;
    this.save(task);
    this.edit(event, null);
  }

  remove(event: Event, task: Task): void {
    event.stopPropagation();
    task.deleted = true;
    this.save(task);

    if (!this.hasTasks()) {
      this.dateService.hasTasks.next(false);
    }
  }

  undo(event: Event, task: Task): void {
    event.stopPropagation();
    task.deleted = null;
    this.save(task);
  }

  private hasTasks(): boolean {
    let result = false;
    this.tasks.map(task => {
      if (!task.deleted) {
        result = true;
        return true;
      }
    });
    return result;
  }

  private clean_deleted(tasks): Task[] {
    tasks.map(task => {
      if (task.deleted) {
        this.remove_forever(task);
      }
    });
    return tasks.filter(task => !task.deleted);
  }

  private remove_forever(task): void {
    this.tasksService.remove(task).subscribe(_ => {
    }, error => console.error(error));
  }

  private save(task: Task): void {
    this.tasksService.update(task).subscribe(_ => {
    }, error => console.error(error));
  }
}
