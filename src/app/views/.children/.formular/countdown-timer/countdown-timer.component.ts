import { Component, Input } from '@angular/core';
import { UtilCountdown } from 'src/app/utils/util.countdown';

@Component({
  selector: 'mpl-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss'
})
export class CountdownTimerComponent {
  @Input() targetDate!: string; // Input date in string format
  nachricht: string = ""

  intervalId: any

  UtilCountdown: UtilCountdown = new UtilCountdown();

  constructor(){}

  ngOnInit(): void {
    this.UtilCountdown.startCountdown(this.targetDate);
    this.intervalId = setInterval(() => this.nachricht = this.UtilCountdown.getCountdown(), 1000);
  }

  ngOnDestroy(): void {
    this.UtilCountdown.clearInterval();
    clearInterval(this.intervalId);
  }
}
