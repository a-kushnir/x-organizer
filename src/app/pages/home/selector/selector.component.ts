import { Component, OnInit } from '@angular/core';
import { faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { DateService } from '../../../shared/services/date.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class SelectorComponent implements OnInit {
  faCaretRight = faCaretRight;
  faCaretLeft = faCaretLeft;

  constructor(public dateService: DateService) { }

  ngOnInit(): void {
  }

  addMonths(amount: number): void {
    this.dateService.addMonths(amount);
  }

  reset(): void {
    this.dateService.reset();
  }
}
