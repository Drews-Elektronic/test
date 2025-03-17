import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mpl-ergebnis-tabelle',
  templateUrl: './ergebnis-tabelle.component.html',
  styleUrl: './ergebnis-tabelle.component.scss'
})
export class ErgebnisTabelleComponent {
  tabellen_spalten: string[] = ["nr", "btqbeschreibung", "htnr", "htnh", "lieferant", "lieferzeit", "mindestbestellmenge", "vpe", "stueckpreis", "technDatenBQ", "auswaehlen"];
  tabellen_daten: MatTableDataSource<any> = new MatTableDataSource()
  @Input() ergebnis_bauteile!: any[]
  @Input() gesamtmenge!: number

  @Output() bauteil_ausgewaehlt = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  ngOnInit(){
    
  }

  ngAfterViewInit(){
    this.tabellen_daten.data = this.ergebnis_bauteile
    this.tabellen_daten.paginator = this.paginator
    this.tabellen_daten._updateChangeSubscription();
  }

  ngOnChanges(change: any){
    this.tabellen_daten.data = this.ergebnis_bauteile
    this.tabellen_daten._updateChangeSubscription();
  }

  //#region Formular Funktionen
  bauteil_auswaehlen(bauteil: any){
    this.bauteil_ausgewaehlt.emit(bauteil);
  }
  //#endregion
  //#region Filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tabellen_daten.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
}
