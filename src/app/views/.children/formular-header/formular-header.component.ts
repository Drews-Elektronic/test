import { Component, Input } from '@angular/core';

@Component({
  selector: 'mpl-formular-header',
  templateUrl: './formular-header.component.html',
  styleUrls: ['./formular-header.component.scss']
})
export class FormularHeaderComponent {
  @Input() CurrentTitle: string = "";
  @Input() insgesamt: number | undefined;
  @Input() einruecken: boolean = false;
}
