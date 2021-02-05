import {AfterViewChecked, ApplicationRef, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {faEdit, faTrash, faPlusCircle, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {DateService} from 'src/app/shared/services/date.service';
import {TaskService} from 'src/app/shared/services/task.service';
import {Task} from 'src/app/shared/models/task.model';
import {DayStatusService, Statuses} from 'src/app/shared/services/day-status.service';
import {AutoUnsubscribe} from 'src/app/shared/auto-unsubscribe';
import {dbDateTime, dbTime, toTime} from 'src/app/shared/date-format';
import {Options} from 'sortablejs';
import * as $ from 'jquery';
import * as cloneDeep from 'lodash/cloneDeep';

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
  readonly toTime = toTime;

  formNew: FormGroup;
  formEdit: FormGroup;
  tasks: Task[] = [];
  editTaskId: string = null;
  focus: boolean;

  sortOptions: Options = {
    group: {
      name: 'tasks',
      put: ['tasks'],
    },
    filter: 'input, textarea',
    preventOnFilter: false,
    onUpdate: () => this.onSortUpdate(),
    onMove: (event) => this.onSortMove(event),
    onEnd: (event) => this.onSortEnd(event),
  };

  private $tasks: Subscription;
  private $date: Subscription;

  @ViewChild('newTask') private newTaskField: ElementRef;
  @ViewChild('editTask') private editTaskField: ElementRef;

  constructor(public dateService: DateService,
              private taskService: TaskService,
              private dayStatusService: DayStatusService,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  private static getTime(value: string): string {
    const parsed = moment(value, 'h:mm a');
    return (parsed.isValid() ? dbTime(parsed) : null);
  }

  ngOnInit(): void {
    this.$tasks = this.taskService.tasks.subscribe(this.onTasksChange.bind(this));
    this.$date = this.dateService.date.subscribe(this.onDateChange.bind(this));

    this.formNew = new FormGroup({
      note: new FormControl('', Validators.required),
      time: new FormControl('')
    });
    this.formEdit = new FormGroup({
      note: new FormControl('', Validators.required),
      time: new FormControl('')
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
    this.autoGrowTextZone({target: this.newTaskField.nativeElement});
    if (this.editTaskField) {
      this.autoGrowTextZone({target: this.editTaskField.nativeElement});
    }
  }

  onDateChange(_: moment.Moment): void {
    this.cleanDeleted(this.tasks);
    this.tasks = [];
    this.editTaskId = null;
  }

  onTasksChange(tasks: Task[]): void {
    this.tasks = cloneDeep(tasks);
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

  onSortMove(event): any {
    const target = event.to;
    const item = event.dragged;

    $('.calendar-table td').removeClass('sortable-target');
    if ($(target).is('.calendar-table td')) {
      item.hidden = true;
      $(target).addClass('sortable-target');
      return 1;
    }
    else {
      item.hidden = false;
    }
  }

  onSortEnd(event): void {
    $('.calendar-table td').removeClass('sortable-target');

    const target = event.to;
    if ($(target).is('.calendar-table td')) {
      const date = moment($(target).data('date'));
      const taskId = $(event.item).data('task-id');
      const task = this.taskService.tasks.value.find(t => t.id === taskId);
      this.moveTaskTo(task, date);
    }
  }

  create(): void {
    const {note, time} = this.formNew.value;

    if (!note || note.trim() === '') {
      return;
    }

    const task: Task = {
      date: this.dateService.date.value,
      note,
      time: OrganizerComponent.getTime(time),
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
      const time = task.time ? toTime(task.time).format('h:mm a') : '';
      this.formEdit.setValue({note: task.note, time});
      this.focus = true;
    }
  }

  toggleComplete(task: Task, subTask?: number): void {
    const obj = subTask != null ? task.subTasks[subTask] : task;

    if (obj.completedAt) {
      delete obj.completedAt;
    } else {
      obj.completedAt = dbDateTime();
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
    const {note, time} = this.formEdit.value;

    if (!note || note.trim() === '') {
      return;
    }

    task.note = note;
    task.time = OrganizerComponent.getTime(time);
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
        this.deleteForever(task);
      }
    });
    return tasks.filter(task => !task.deleted);
  }

  private deleteForever(task): void {
    this.taskService.delete(task)
      .catch(error => console.error(error));
  }

  private save(task: Task): void {
    this.taskService.update(task).then(() => {
      this.updateCalendar(task.date, this.tasks);
    }).catch(error => console.error(error));
  }

  private moveTaskTo(task: Task, date: moment.Moment): void {
    if (task.date.isSame(date)) {
      // Restore tasks
      this.taskService.tasks.next(this.taskService.tasks.value);
      this.changeDetectorRef.detectChanges();
    } else {
      // Move tasks
      this.taskService.delete(task).then(() => {
        this.updateCalendar(task.date, this.tasks);
        task.date = date;
        task.sortOrder = 0;
        this.taskService.create(task).then(() => {
          this.taskService.findByDate(date).then((tasks) => {
            this.updateCalendar(task.date, tasks);
          }).catch(error => console.error(error));
        }).catch(error => console.error(error));
      }).catch(error => console.error(error));
    }
  }

  onTaskKeyDown(e): void {
    if (e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
    }
  }

  autoGrowTextZone(e): void {
    e.target.style.height = '0px';
    e.target.style.height = (e.target.scrollHeight + 2) + 'px';
  }
}
