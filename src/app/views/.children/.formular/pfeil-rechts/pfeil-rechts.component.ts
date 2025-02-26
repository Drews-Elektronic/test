import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mpl-pfeil-rechts',
  templateUrl: './pfeil-rechts.component.html',
  styleUrl: './pfeil-rechts.component.scss'
})
export class PfeilRechtsComponent {

  @Output() click_event: EventEmitter<any> = new EventEmitter<boolean>();
  
  @Input() disabled: boolean = false
  
  click_funktion(event: Event){
    event.stopPropagation()

    this.click_event.emit(true);
  }

}
