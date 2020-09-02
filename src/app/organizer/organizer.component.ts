import { Component, OnInit } from '@angular/core';
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import {DateService} from '../shared/date.service';

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss']
})
export class OrganizerComponent implements OnInit {
  faTrash = faTrash;
  faPlusCircle = faPlusCircle;

  constructor(public dateService: DateService) {
    dateService.date.subscribe(this.getNotes.bind(this));
  }

  ngOnInit(): void {
  }

  getNotes(): void {
    const date = this.dateService.date;
  }
}
