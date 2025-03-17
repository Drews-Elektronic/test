import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'mpl-button-close',
  templateUrl: './button-close.component.html',
  styleUrl: './button-close.component.scss'
})
export class ButtonCloseComponent {
  @Output() click_event: EventEmitter<any> = new EventEmitter<boolean>();

  click_funktion(event: Event){
    event.stopPropagation()

    this.click_event.emit(true);
  }
}
