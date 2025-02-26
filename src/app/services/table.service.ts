// Wird nur Temporär verwendet, um einige Wiederhollende Angular Material Funktionen hier abzulegen und zu verwenden
// Sobald die Child Komponente Table fertig entwickelt wurde, wird dieser Service nicht mehr benötigt.

import { Injectable } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

export const getTrigger = [
  trigger('detailExpand', [
    state('collapsed', style({height: '0px', minHeight: '0'})),
    state('expanded', style({height: '*'})),
    transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ]),
  /*
  trigger('outlineExpand', [
    state('outline_hidden', style({outline: "none", "padding-top": "0px"})),
    state('outline_show', style({outline: "1px solid rgb(220, 220, 220)", "padding-top": "16px"})),
    //transition('outline_show <=> outline_hidden', animate('225ms')),
  ])
  */
]

@Injectable({
  providedIn: 'root'
})
export class TableService {
  
  constructor() { }

}
