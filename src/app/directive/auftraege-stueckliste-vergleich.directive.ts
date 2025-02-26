/**
 * Dieses Direktiv wird verwendet, um im Auftrags BOM Vergleich die unterschiedlichen Soll- und Ist-Bauteile farblich zu markieren.
 * 
 * !!!!!!! Leider kann das Direktiv mit dem @Input nicht verwendet werden, obwohl es im app.module.ts eingebunden ist. Der Grund ist mir unbekannt.
 * 
 * Fehlermeldung: 
 *    error NG8002: Can't bind to 'mplAuftraegeStuecklisteVergleich' since it isn't a known property of 'div'.
*                   [mplAuftraegeStuecklisteVergleich]="test"
*/


import { Directive, Input, ElementRef } from '@angular/core';
import { QuellenStatus } from '../enum/quellen-status';
import { Beistellung } from '../enum/beistellung';

@Directive({
  selector: '[mplAuftraegeStuecklisteVergleich]'
})
export class AuftraegeStuecklisteVergleichDirective {

  @Input() object: any;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Es darf nicht beigestellt werden
    if(this.object?.agbskd == Beistellung.BESCHAFFUNG){
      // Es muss verfügbar sein
      if(
        this.object?.maxlbverfuegbar == QuellenStatus.VERFUEGBAR 
        || this.object?.maxlbverfuegbar == QuellenStatus.VERFUEGBAR_IN 
        || this.object?.maxlbverfuegbar == QuellenStatus.ALTERNATIVE_VERFUEGBAR 
        || this.object?.maxlbverfuegbar == QuellenStatus.ALTERNATIVE_VERFUEGBAR_IN
      ){
        // Prüfe, ob Soll und Ist unterschiedlich sind
        if(this.object?.ist_element != this.object?.soll_element){
          // Hintergrund färben
          this.el.nativeElement.style.backgroundColor = 'yellow';
        }
      }
    }
  }
}