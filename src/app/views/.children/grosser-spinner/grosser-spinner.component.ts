import { Component, Input } from '@angular/core';

@Component({
  selector: 'mpl-grosser-spinner',
  templateUrl: './grosser-spinner.component.html',
  styleUrl: './grosser-spinner.component.scss'
})
export class GrosserSpinnerComponent {

  @Input() text: string = ""

}
