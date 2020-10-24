import {Component, NgZone, OnInit} from '@angular/core';
import {FormComponent} from '../../shared/components/form/form.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {faPlay, faStop, faPause, faUndo} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent extends FormComponent implements OnInit {
  private handle: number;
  private timeLeft: number;

  minutes = 15;
  seconds = 0;
  ticking = false;
  alerting = false;
  audio = new Audio();

  faPlay = faPlay;
  faStop = faStop;
  faPause = faPause;
  faUndo = faUndo;

  constructor(private zone: NgZone) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      minutes: new FormControl(this.minutes, [Validators.required, Validators.max(30), Validators.min(0)]),
      seconds: new FormControl(this.seconds, [Validators.required, Validators.max(59), Validators.min(0)])
    });

    this.audio.src = 'assets/audio/alert.wav';
    this.audio.loop = true;
    this.audio.load();
  }

  get src(): string {
    const ts =  30 * 60 - this.timeLeft;
    return `https://www.youtube.com/embed/jpVa0ATXIq0?start=${ts}&autoplay=1&controls=0&loop=0&rel=0`;
  }

  onSubmit(): void {
    const {minutes, seconds} = this.form.value;
    this.minutes = minutes;
    this.seconds = seconds;
    this.ticking = !this.ticking;
    this.stopAlert();

    if (this.ticking) {
      this.timeLeft = this.minutes * 60 + this.seconds;
      this.startTimer();
    }
    this.submitted = false;
  }

  pause(): void {
    this.stopAlert();

    if (this.ticking) {
      this.ticking = false;
      this.stopTimer();

    } else if (this.timeLeft > 0) {
      this.ticking = true;
      this.startTimer();
    }
  }

  restart(): void {
    this.stopAlert();
    this.timeLeft = this.minutes * 60 + this.seconds;
    this.ticking = true;
    this.startTimer();
  }

  playAlert(): void {
    this.alerting = true;
    this.audio.currentTime = 0;
    this.audio.play().then();
  }

  stopAlert(): void {
    this.alerting = false;
    this.audio.pause();
  }

  private startTimer(): void {
    this.zone.runOutsideAngular(() => {
      this.handle = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.ticking = false;
          clearInterval(this.handle);
          this.zone.run(this.playAlert.bind(this));
        }
      }, 1000);
    });
  }

  private stopTimer(): void {
    this.zone.runOutsideAngular(() => {
      clearInterval(this.handle);
    });
  }
}
