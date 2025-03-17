import { Component, Input } from '@angular/core';

@Component({
  selector: 'mpl-action-button',
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss'
})
export class ActionButtonComponent {
  @Input() name!: string;
}
