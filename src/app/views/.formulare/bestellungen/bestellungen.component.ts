import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { BackendService } from 'src/app/services/backend.service';
import { getTrigger } from 'src/app/services/table.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { UtilFormular } from 'src/app/utils/util.formular';

import { BestellungStatus } from 'src/app/enum/bestellung-status';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-bestellungen',
  templateUrl: './bestellungen.component.html',
  styleUrl: './bestellungen.component.scss',
  animations: getTrigger
})
export class BestellungenComponent {
  spinning: boolean = false;
  bereit: boolean = false;

  filterAll: string = ""

  columnsToDisplay = [
    'bestellungID', 'aunr', 'beschreibung', 'bgnrkd', 'bgbezeichnungkd', 'bestelldatum', 'bestaetigt', 'bestellmenge', 'liefertermin', 'gesamtpreis', 'suche'
  ];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: any | null | undefined;

  bestellungen: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  selection: any = new SelectionModel<any>(true, []);

  BestellungStatus = BestellungStatus
  BestellungStatusArray = Object.values(BestellungStatus)
                                .filter((value) => typeof value === "number")
                                .map((value) => value);

  constructor(
    private backend: BackendService,
    private router: Router,
    private mitteilungService: MitteilungService
  ) { }

  ngOnInit(){
    const promises: Promise<any>[] = [
      this.BestellungAnzeigen()
    ]
    
    // Sobald der Auftrag und Wunschtermin geladen sind, sollen durch alle Wunschtermine durch gegangen werden
    Promise.all(promises).then((value:any)=>{
      if(this.bestellungen){
        this.bereit = true
      }
    })
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region Get
  BestellungAnzeigen(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .BestellungAnzeigen()
        .subscribe((value: any) => {
          subscription.unsubscribe();
          
          if (value !== false) {
            this.bestellungen.data = value;
            this.bestellungen.paginator = this.paginator;
            this.bestellungen._updateChangeSubscription()
          }else{
            this.bestellungen.data = [];
            this.bestellungen.paginator = this.paginator;
            this.bestellungen._updateChangeSubscription()
          }

          resolve(value);
        }, (error: any)=>{
          console.error(error)
          reject(error);
        });
    })
  }
  //#endregion
  //#region update, delete
  BestellungLoeschen(event: Event | null, bestellung: any = undefined){
    if(event){
      event.stopPropagation()
    }

    let length: number
    let bestellung_name: string
    if(bestellung){
      length = 1
      bestellung_name = bestellung?.bestellungID
    }else{
      length = this.selection.selected.length
      bestellung_name = this.selection.selected[0].bestellungID
    }

    let titel: string;
    let content: string;
    if(length > 1){
      titel = length + " Auftrag Löschen";
      content = "Wollen Sie wirklich die " + length + " Auftrag unwiderruflich löschen?"
    }else{
      titel = "Auftrag '" + bestellung_name + "' Löschen";
      content = "Wollen Sie wirklich den Auftrag unwiderruflich löschen?"
    }
    
    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .BestellungLoeschen(bestellung.bestellungID)
        .subscribe((value: any) => {
          subscription.unsubscribe();
          
          if (value !== false) {
            this.bestellungen = value;
          }

          resolve(value);
        }, (error: any)=>{
          console.error(error)
          reject(error);
        });
    })
  }
  //#endregion
  //#region umleitung
  ViewBaugruppe(): void {
    this.router.navigate(UtilUrl.baugruppen.baugruppen)
  }
  ViewLeiterplattendaten(bestellungID: number): void {
    this.router.navigate(UtilUrl.bestellungen.leiterplatte(bestellungID))
  }
  ViewAuftragsStueckliste(bestellungID: number): void {
    this.router.navigate(UtilUrl.bestellungen.bom(bestellungID))
  }
  Umleiten_nach_Dateien(bestellungID: number){
    this.router.navigate(UtilUrl.bestellungen.unterlagen(bestellungID))
  }
  Umleiten_nach_Stripe_Rechnung(url: string){
    window.open(url, '_blank')
  }
  //#endregion
  //#region filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.bestellungen.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
  //#region selection
  /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
  isAllSelected() {
    return UtilFormular.isAllSelected(this.selection, this.bestellungen.data.length); 
  }

  /** Alle Zeilen auswaehlen oder abwaehlen */
  toggleAllRows() {
    UtilFormular.toggleAllRows(this.selection, this.bestellungen.data.length, this.bestellungen);
  }
  //#endregion
  //#region Table
  trackByFn(index: number, item: any){
    return item.bestellungID || index;
  }
  //#endregion

}
