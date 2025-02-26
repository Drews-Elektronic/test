import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mpl-pfeil-links',
  templateUrl: './pfeil-links.component.html',
  styleUrl: './pfeil-links.component.scss'
})
export class PfeilLinksComponent {

  @Output() click_event: EventEmitter<any> = new EventEmitter<boolean>();

  @Input() disabled: boolean = false

  click_funktion(event: Event){
    event.stopPropagation()

    this.click_event.emit(true);
  }
  
}
