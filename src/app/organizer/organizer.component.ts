import { Component, OnInit } from '@angular/core';
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateService } from '../shared/date.service';
import { TasksService, Task } from '../shared/tasks.service';

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss']
})
export class OrganizerComponent implements OnInit {
  readonly faTrash = faTrash;
  readonly faPlusCircle = faPlusCircle;

  form: FormGroup;

  constructor(public dateService: DateService,
              public tasksService: TasksService) {
    dateService.date.subscribe(this.getNotes.bind(this));
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      note: new FormControl('', Validators.required)
    });
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
