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
  editTaskId: string = null;
  focus: boolean;

  @ViewChild('newTask') private newTaskField: ElementRef;
  @ViewChild('editTask') private editTaskField: ElementRef;

  constructor(public dateService: DateService,
              private taskService: TaskService,
              private dayStatusService: DayStatusService) {
  }

  ngOnInit(): void {
    this.taskService.tasks.subscribe(tasks => {
      this.tasks = tasks;
      if (this.editTaskId && !this.tasks.some(task => task.id === this.editTaskId)) {
        this.editTaskId = null;
      }
    });
    this.dateService.date.subscribe(_ => {
      this.cleanDeleted(this.tasks);
      this.editTaskId = null;
      this.focus = true;
    });

    this.formNew = new FormGroup({
      note: new FormControl('', Validators.required)
    });
    this.formEdit = new FormGroup({
      note: new FormControl('', Validators.required)
    });
  }

  ngAfterViewChecked(): void {
    if (this.focus) {
      if (this.editTaskField) {
        this.editTaskField.nativeElement.focus();
      } else {
        this.newTaskField.nativeElement.focus();
      }
      this.focus = false;
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
      this.updateCalendar(task.date, this.tasks);
    }).catch(error => console.error(error));
  }

  edit(event: Event, task: Task): void {
    event.stopPropagation();
    this.editTaskId = task?.id;
    this.formEdit.reset();
    if (task) {
      this.formEdit.setValue({note: task.note});
      this.focus = true;
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

  private cleanDeleted(tasks): Task[] {
    tasks.map(task => {
      if (task.deleted) {
        this.removeForever(task);
      }
    });
    return tasks.filter(task => !task.deleted);
  }

  private removeForever(task): void {
    this.taskService.remove(task)
      .catch(error => console.error(error));
  }

  private save(task: Task): void {
    this.taskService.update(task).then(_ => {
      this.updateCalendar(task.date, this.tasks);
    }).catch(error => console.error(error));
  }
}
