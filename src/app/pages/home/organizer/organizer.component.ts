import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {faEdit, faTrash, faPlusCircle, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {DateService} from 'src/app/shared/date.service';
import {TaskService} from 'src/app/shared/task.service';
import {Task} from 'src/app/shared/models/task.model';
import {DayStatusService, Statuses} from 'src/app/shared/day-status.service';
import {AutoUnsubscribe} from 'src/app/shared/auto-unsubscribe';
import {dbDateTime} from 'src/app/shared/date-format';
import {Options} from 'sortablejs';

@AutoUnsubscribe
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

  sortOptions: Options = {
    onUpdate: () => this.onSortUpdate(),
  };

  private $tasks: Subscription;
  private $date: Subscription;

  @ViewChild('newTask') private newTaskField: ElementRef;
  @ViewChild('editTask') private editTaskField: ElementRef;

  constructor(public dateService: DateService,
              private taskService: TaskService,
              private dayStatusService: DayStatusService) {
  }

  ngOnInit(): void {
    this.$tasks = this.taskService.tasks.subscribe(this.onTasksChange.bind(this));
    this.$date = this.dateService.date.subscribe(this.onDateChange.bind(this));

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

  onDateChange(_: moment.Moment): void {
    this.cleanDeleted(this.tasks);
    this.editTaskId = null;
  }

  onTasksChange(tasks: Task[]): void {
    this.tasks = tasks;
    if (this.editTaskId && !this.tasks.some(task => task.id === this.editTaskId)) {
      this.editTaskId = null;
    }
  }

  onSortUpdate(): void {
    let sortOrder = 0;
    this.tasks.forEach(task => {
      task.sortOrder = sortOrder++;
    });
    this.taskService.updateAll(this.tasks).then(() => {
    }).catch(error => console.error(error));
  }

  create(): void {
    const {note} = this.formNew.value;

    if (!note || note.trim() === '') {
      return;
    }

    const task: Task = {
      date: this.dateService.date.value,
      note,
      createdAt: dbDateTime()
    };
    this.formNew.reset();
    this.tasks.push(task);
    TaskService.sort(this.tasks);

    this.taskService.create(task).then(() => {
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

  toggleComplete(task: Task): void {
    if (task.completedAt) {
      delete task.completedAt;
    } else {
      task.completedAt = dbDateTime();
    }
    TaskService.sort(this.tasks);
    this.save(task);
    this.playAudio();
  }

  playAudio(): void {
    const audio = new Audio();
    audio.src = 'assets/audio/click.wav';
    audio.load();
    audio.play().then();
  }

  toggleSelect(task: Task): void {
    // task.selected = !task.selected;
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
      } else if (task.done || task.completedAt) {
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
