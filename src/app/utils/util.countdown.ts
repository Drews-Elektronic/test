export class UtilCountdown {
  private timeLeft: number = 0;
  private hours: number = 0;
  private minutes: number = 0;
  private seconds: number = 0;
  private intervalId: any;

  public startCountdown(targetDate: string): void {
    const targetTime = new Date(targetDate).getTime();
    const now = new Date().getTime();
    
    if (now < targetTime) {
      this.updateTimeLeft(targetTime);
      this.intervalId = setInterval(() => this.updateTimeLeft(targetTime), 1000);
    }
  }

  private updateTimeLeft(targetTime: number): void {
    const now = new Date().getTime();
    this.timeLeft = targetTime - now;
    
    if (this.timeLeft <= 0) {
      clearInterval(this.intervalId);
      this.timeLeft = 0;
    } else {
      this.hours = Math.floor((this.timeLeft / (1000 * 60 * 60)) % 24);
      this.minutes = Math.floor((this.timeLeft / (1000 * 60)) % 60);
      this.seconds = Math.floor((this.timeLeft / 1000) % 60);
    }
  }

  public getCountdown(): string{
    if(this.timeLeft > 0){
      return 'Restliche Zeit: ' + this.minutes + 'm ' + this.seconds + 's';
    }else{
      return 'Angebot ist abgelaufen';
    }
  }

  public istAbgelaufen(): boolean{
    if(this.timeLeft > 0){
      return false;
    }else{
      return true;
    }
  }

  public clearInterval(){
    clearInterval(this.intervalId);
  }
}
