import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { BackendService } from 'src/app/services/backend.service';
import { getTrigger } from 'src/app/services/table.service';

import { MatTableDataSource } from '@angular/material/table';

import { UtilFormular } from 'src/app/utils/util.formular';

import { Beistellung } from 'src/app/enum/beistellung';
import { QuellenStatus } from 'src/app/enum/quellen-status';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'mpl-bom-tabelle',
  templateUrl: './bom-tabelle.component.html',
  styleUrl: './bom-tabelle.component.scss',
  animations: getTrigger
})
export class BomTabelleComponent {
  @Input() bereit: boolean = false;
  @Input() bereit_alle_verfuegbarkeiten:boolean = true;
  @Input() bereit_eine_verfuegbarkeit:boolean = true;

  @Input() erstes_coloum!: Array<string>;
  @Input() zweites_coloum!: Array<string>;
  @Input() tabellen_daten!: MatTableDataSource<any>;

  @Input() komprimiert!: boolean;

  @Input() top_teuersten_bauteile: number[] = [];
  @Input() top_laengste_lieferzeit: number[] = [];

  @Input() baugruppenmenge: number | undefined;

  @Input() FormFields!: any

  @Input() alternative_loeschen: boolean = false

  @Output() loesche_eines_event  = new EventEmitter<any>();
  @Output() loesche_alles_event  = new EventEmitter<any>();

  @Output() alternative_suche_event                       = new EventEmitter<any>();
  @Output() alternative_loeschen_event                    = new EventEmitter<any>();

  @Output() Bauteil_als_beschaffen_umstellen_event        = new EventEmitter<any>();
  @Output() Bauteil_als_beigestellt_umstellen_event       = new EventEmitter<any>();
  @Output() Bauteil_als_nicht_bestuecken_umstellen_event  = new EventEmitter<any>();

  @Input() eine_verfuegbarkeit: boolean = false;
  @Output() eine_verfuegbarkeit_event  = new EventEmitter<any>();

  selection: any = new SelectionModel<any>(true, []);

  // Enum's
  QuellenStatus = QuellenStatus
  Beistellung = Beistellung

  expandedElement: any | null | undefined;
  hoveredElement: any = null; // Wenn die Maus über eine Zeile ist, soll es aufleuchten

  environment= environment

  constructor(
    
  ) {
    
  }

  //#region Delete
  loescheAlles(event: any){
    event.stopPropagation();

    this.loesche_alles_event.emit(this.selection)
  }
  
  loescheEines(event: any, bauteil: any){
    event.stopPropagation();

    this.loesche_eines_event.emit(bauteil)
  }
  //#endregion
  //#region Bauteil beistellen, beschaffen oder nicht bestücken 
  Bauteil_als_beschaffen_umstellen(event: any, bauteil: any){
    event.stopPropagation();

    this.Bauteil_als_beschaffen_umstellen_event.emit(bauteil)
  }
  Bauteil_als_beigestellt_umstellen(event: any, bauteil: any){
    event.stopPropagation();
    
    this.Bauteil_als_beigestellt_umstellen_event.emit(bauteil)
  }
  Bauteil_als_nicht_bestuecken_umstellen(event: any, bauteil: any){
    event.stopPropagation();

    this.Bauteil_als_nicht_bestuecken_umstellen_event.emit(bauteil)
  }
  //#endregion
  //#region Alternatives Bauteil
  alternative_suche(event: any, bauteil: any){
    event.stopPropagation();

    this.alternative_suche_event.emit(bauteil)
  }
  alternatives_loeschen(event: any, bauteil: any){
    event.stopPropagation();

    this.alternative_loeschen_event.emit(bauteil)
  }
  
  //#endregion
  //#region Tabellen Funktionen
  onMouseEnter(element: any): void {
    this.hoveredElement = element;
  }

  onMouseLeave(): void {
    this.hoveredElement = null;
  }

  /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
  isAllSelected() {
    return UtilFormular.isAllSelected(this.selection, this.tabellen_daten.data.length); 
  }

  /** Alle Zeilen auswaehlen oder abwaehlen */
  toggleAllRows() {
    UtilFormular.toggleAllRows(this.selection, this.tabellen_daten.data.length, this.tabellen_daten);
  }

  eine_verfuegbarkeit_funktion(event: any, bauteil: any){
    event.stopPropagation();

    this.eine_verfuegbarkeit_event.emit(bauteil)
  }
  //#endregion
  //#region filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tabellen_daten.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
}
