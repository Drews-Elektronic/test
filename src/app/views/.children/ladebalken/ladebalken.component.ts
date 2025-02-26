import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mpl-ladebalken',
  templateUrl: './ladebalken.component.html',
  styleUrl: './ladebalken.component.scss'
})
export class LadebalkenComponent {
  @Input() lade_status: number = 100;
  @Output() lade_statusChange: EventEmitter<number> = new EventEmitter<number>();

  @Input() falsches_laden_beginnen: boolean | null = null;

  abbrechen: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.laden(this.falsches_laden_beginnen);
  }

  ngOnChanges(change: any): void {
    const tmp_falsches_laden_beginnen: boolean | null = change?.falsches_laden_beginnen?.currentValue

    if(tmp_falsches_laden_beginnen !== true){
      if(change.lade_status){
        this.abbrechen = true;

        if(change?.lade_status?.currentValue < 0){
          this.lade_status = 0
        }else{
          this.lade_status = change?.lade_status?.currentValue
        }
      }
    }

    if(tmp_falsches_laden_beginnen !== null){
      if(tmp_falsches_laden_beginnen === true){
        this.abbrechen = false;
        this.laden(tmp_falsches_laden_beginnen);
      }else if(tmp_falsches_laden_beginnen === false){
        this.abbrechen = true;
        this.lade_status = 100;
      }

      this.falsches_laden_beginnen = null;
    }

    if(change?.lade_status?.currentValue === -1){
      this.lade_status = 0
    }
  }

  // Falsches Laden
  async laden(tmp_falsches_laden_beginnen: boolean | null) {
    if(tmp_falsches_laden_beginnen === true){
      this.lade_status = 0;
      for (let index = 0; index < 100; index++) {
        if(this.abbrechen === true){
          this.abbrechen = false;
          break;
        }

        if(this.lade_status >= 100){
          this.lade_status = 100;
          break;
        }

        if(this.lade_status < 16){
          await this.delay(324);
        }else if(this.lade_status < 59){
          await this.delay(54);
        }else if(this.lade_status < 86){
          await this.delay(789);
        }else if(this.lade_status < 92){
          await this.delay(1000);
        }
        
        if(this.lade_status < 92){
          this.lade_status++;
        }
      }
    }
  }
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
