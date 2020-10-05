import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {faEdit, faTrash, faPlusCircle, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DateService} from 'src/app/shared/date.service';
import {TaskService} from 'src/app/shared/task.service';
import {switchMap} from 'rxjs/operators';
import {Task} from 'src/app/shared/models/task.model';
import * as moment from 'moment';
import {DayStatusService, Statuses} from '../../../shared/day-status.service';

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss']
})
export class OrganizerComponent implements OnInit, AfterViewChecked {
  readonly faEdit = faEdit;
  readonly faTrash = faTrash;
  readonly faPlusCircle = faPlusCircle;
  readonly faCheck = faCheck;
  readonly faTimes = faTimes;

  formNew: FormGroup;
  formEdit: FormGroup;
  tasks: Task[] = [];
  editTask: Task = null;

  @ViewChild('newTask') newTaskField: ElementRef;
  @ViewChild('editTask') editTaskField: ElementRef;

  constructor(public dateService: DateService,
              private taskService: TaskService,
              private dayStatusService: DayStatusService) {
  }

  ngOnInit(): void {
    this.dateService.date.pipe(
      switchMap(value => this.taskService.all(value))
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

  ngAfterViewChecked(): void {
    if (this.editTaskField) {
      this.editTaskField.nativeElement.focus();
    } else {
      this.newTaskField.nativeElement.focus();
    }
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

    this.taskService.create(task).then(newTask => {
      this.formNew.reset();
      this.tasks.push(newTask);
      this.updateCalendar(task.date, this.tasks);
    }).catch(error => console.error(error));
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
    this.updateCalendar(task.date, this.tasks);
  }

  undo(event: Event, task: Task): void {
    event.stopPropagation();
    task.deleted = null;
    this.save(task);
  }

  private updateCalendar(date: moment.Moment, tasks: Task[]): void {
    let active = false;
    let done = false;
    tasks.forEach(task => {
      if (task.deleted) {
        // skip
      } else if (task.done) {
        done = true;
      } else {
        active = true;
      }
    });
    const status = active ? Statuses.Active :
                   done ? Statuses.Done : null;
    this.dayStatusService.update(date, status);
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
    this.taskService.remove(task).then(_ => {
      this.updateCalendar(task.date, this.tasks);
    }).catch(error => console.error(error));
  }

  private save(task: Task): void {
    this.taskService.update(task).then(_ => {
      this.updateCalendar(task.date, this.tasks);
    }).catch(error => console.error(error));
  }
}
