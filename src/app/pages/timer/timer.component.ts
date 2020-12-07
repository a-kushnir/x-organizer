import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {FormComponent} from '../../shared/components/form/form.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {faPlay, faStop, faPause, faUndo} from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent extends FormComponent implements OnInit {

  constructor(private zone: NgZone) {
    super();
  }
  private handle: number;
  private timeLeft: number;

  minutes = 15;
  seconds = 0;
  ticking = false;
  alerting = false;
  audioAlert = new Audio();
  audioTimer = new Audio();

  faPlay = faPlay;
  faStop = faStop;
  faPause = faPause;
  faUndo = faUndo;

  @ViewChild('countdown') private countdown: ElementRef;

  ngOnInit(): void {
    this.form = new FormGroup({
      minutes: new FormControl(this.minutes, [Validators.required, Validators.max(30), Validators.min(0)]),
      seconds: new FormControl(this.seconds, [Validators.required, Validators.max(59), Validators.min(0)])
    });

    this.audioAlert.src = 'assets/audio/alert.wav';
    this.audioAlert.loop = true;
    this.audioAlert.load();

    this.audioTimer.src = 'assets/audio/timer.mp3';
    this.audioTimer.loop = true;
    this.audioTimer.load();

    // Seamless loop workaround
    this.audioTimer.addEventListener('timeupdate', function(): void {
      const buffer = .15;
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0;
        this.play();
      }
    });
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
    this.audioTimer.pause();
    this.audioAlert.currentTime = 0;
    this.audioAlert.play().then();
  }

  stopAlert(): void {
    this.alerting = false;
    this.audioAlert.pause();
  }

  formatTime(seconds: number): string {
    const format = seconds > 3600 ? 'H:mm:ss' : 'mm:ss';
    return moment('2001-01-01').startOf('day').seconds(seconds).format(format);
  }

  private startTimer(): void {
    this.zone.runOutsideAngular(() => {
      this.audioTimer.currentTime = 0;
      this.audioTimer.play().then();

      this.handle = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.countdown.nativeElement.innerHTML = this.formatTime(this.timeLeft);
        } else {
          this.ticking = false;
          clearInterval(this.handle);
          this.zone.run(this.playAlert.bind(this));
        }
      }, 1000);
    });
  }

  private stopTimer(): void {
    this.audioTimer.pause();
    this.zone.runOutsideAngular(() => {
      clearInterval(this.handle);
    });
  }
}
