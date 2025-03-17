import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { filter, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { BackendService } from 'src/app/services/backend.service';

import { Bauteil } from 'src/app/interfaces/bauteil';
import { Baugruppe } from 'src/app/interfaces/baugruppe';

import { getTrigger } from 'src/app/services/table.service'
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { DialogComponent } from '../../.children/dialog/dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { UtilFormular } from 'src/app/utils/util.formular';
import { UtilDialog } from 'src/app/utils/util.dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { UtilUrl } from 'src/app/utils/util.url';

export interface AngepassterBauteil { // Angular Material Table kann keine verschachtelten Objekte erkennen.  
  bezeichnung: string;
  beschreibung: string;
  mpn: string;
  hersteller: string;
}

@Component({
  selector: 'mpl-unterlagen',
  templateUrl: './unterlagen.component.html',
  styleUrl: './unterlagen.component.scss',
  animations: getTrigger
})
export class UnterlagenComponent {

  @Input() einruecken: boolean = true;
  @Input() titel: boolean = true;
  @Input() zurueck_button: boolean = true;
  
  @Input() suchen_funktion: boolean = true;

  bgnrkd: string | undefined;

  filterAll: string = "";

  columnsToDisplay = [ 'name', 'ctime', 'size', 'download', 'loeschen'];

  unterlagen: MatTableDataSource<any> = new MatTableDataSource();

  @Input() aunr: any;
  @Input() bgnr: any;
  @Input() bestellungID: any;

  ausgewaehlte_datei: any;

  bereit: boolean = false
  bereit_aunr: boolean = false
  bitte_warten_hochladen: boolean = false

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  selection: any = new SelectionModel<any>(true, []);

  //Checkliste Unterlagen
  @Input() gerberdaten_anzeigen: boolean = true

  gerberdaten     : boolean = false
  bestueckungsplan: boolean = false
  arbeitsanweisung: boolean = false
  @Output() alle_unterlagen_vorhanden: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    public backend: BackendService,
    private mitteilungService: MitteilungService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
    this.aunr = this.activatedRoute.snapshot.paramMap.get('aunr');
    this.bestellungID = this.activatedRoute.snapshot.paramMap.get('bestellungID');

    if(this.bestellungID){
      this.BestellungAnzeigen()
    }else if(this.aunr){
      this.GetUnterlagen();
      this.GetEinenAuftrag(this.aunr)
    }
    
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region GET
  GetUnterlagen() {
    this.bereit = false
    let subscription = this.backend
      .UnterlagenAnzeigen(this.aunr)
      .subscribe((value: any) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.unterlagen = new MatTableDataSource(value);
          this.unterlagen.data.length = value.length;

          this.unterlagen.paginator = this.paginator;
        }
        this.bereit = true
        this.bitte_warten_hochladen = false;
      });
  }

  GetEinenAuftrag(aunr: any){
    let subscription = this.backend
      .GetAuftraege(aunr)
      .subscribe((value: any) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.bgnrkd = value[0].bgnrkd;
        }
        this.bereit_aunr = true;
      });
  }

  BestellungAnzeigen(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .BestellungAnzeigen(this.bestellungID)
        .subscribe((value: any) => {
          subscription.unsubscribe();
          
          if (value !== false) {
            this.aunr = value[0].aunr;
            this.bgnrkd = value[0].bgnrkd;

            this.GetEinenAuftrag(value[0].aunr)
            this.GetUnterlagen()
          }

          resolve(value);
        }, (error: any)=>{
          console.error(error)
          reject(error);
        });
    })
  }
  //#endregion
  //#region Hochladen
  datei_hochladen_vorbereiten(event: any) {
    const datei = event

    let file_name_array = datei.name.split(".")
    let file_extension = file_name_array[file_name_array.length - 1]

    if (file_extension) {
      file_extension = file_extension.toLowerCase();
    }

    // Mime Type Prüfung finden zum einen hier und im Backend statt, weil die Fehlermeldungen vom Backend zum Frontend richtig eingerichet werden müssen 
    switch (file_extension) {
      case "pdf":
      case "jpeg":
      case "png":
      case "xls":
      case "xlsx":
      case "csv":
      case "doc":
      case "docx":
      case "odt":
      case "txt":
        break;
      default:
        //this.mitteilungService.createMessage("Sonstige Dateien akzeptiert nur xls, xlsx, csv, pdf, jpeg und png!", "warning")
        this.mitteilungService.createMessageDialog("Sonstige Dateien akzeptiert nur xls, xlsx, csv, pdf, jpeg und png!")
        return
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        titel: "Datei hochladen",
        content: "Möchten Sie die Datei '" + datei.name + "' hochladen?",
        ja_button_content: "Ja",
        ja_button_style: "success",
        nein_button_exist_not: true
      }
    });

    let subscription1 = dialogRef.afterClosed().pipe(
      tap((result: any) => {                          // abbrechen: undefined; ja: true; nein: false;
        subscription1.unsubscribe();

        if (result) {
          this.datei_hochladen(datei)
        }
      })
    ).subscribe();
  }

  datei_auswaehlen(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.ausgewaehlte_datei = files[0];
    } else {
      this.ausgewaehlte_datei = undefined
    }
  }

  datei_hochladen(file: any) {
    this.bitte_warten_hochladen = true;

    this.bereit = false;
    let subscription = this.backend
      .UnterlageImportieren(file, this.aunr)
      .subscribe((value: any) => {
        subscription.unsubscribe();
        this.GetUnterlagen()


      });
  }
  //#endregion
  //#region Download
  download(unterlage: any) {
    let subscription = this.backend
      .UnterlageDownloaden(unterlage, this.aunr)
      .subscribe((value: any) => {
        subscription.unsubscribe();
      });
  }
  //#endregion
  //#region Delete
  loeschen(unterlage: any = undefined) {
    let length: number
    let unterlage_name: string
    if(unterlage){
      length = 1
      unterlage_name = unterlage.name
    }else{
      length = this.selection.selected.length
      unterlage_name = this.selection.selected[0].name
    }

    let titel: string;
    let content: string;
    if(length > 1){
      titel = length + " Dateien Löschen";
      content = "Wollen Sie wirklich " + length + " Dateien unwiderruflich löschen?"
    }else{
      titel = "Datei '" + unterlage_name + "' Löschen";
      content = "Wollen Sie wirklich die Datei unwiderruflich löschen?"
    }

    UtilDialog.loeschenBestaetigen(
      this.dialog
      , titel
      , content
    ).then(()=>{
      if(unterlage === undefined){
        UtilFormular.loopAngularMaterialTableSelection(
          this.selection
          , (element: any, resolve: any, reject: any)=>{
            let subscription2 = this.backend
              .UnterlageLoeschen(element.name, this.aunr)
              .subscribe((value) => {
                subscription2.unsubscribe();
                
                if (value !== false) {
                  UtilFormular.loescheZeileDurchID(this.unterlagen, 'name', element.name);
                }
  
                resolve(true);
              },(error)=>{
                console.error(error)
                reject(error)
              });
          }
        ).then(()=>{
          this.selection.clear()
        })
      }else{
        let subscription2 = this.backend
          .UnterlageLoeschen(unterlage.name, this.aunr)
          .subscribe((value) => {
            subscription2.unsubscribe();
            
            if (value !== false) {
              UtilFormular.loescheZeileDurchID(this.unterlagen, 'name', unterlage.name);
            }
          });
      }
    })
  }
  //#endregion
  //#region checkbox
  CheckboxCheckedStatus() { // wird nicht mehr benötigt
    if(this.gerberdaten && this.bestueckungsplan && this.arbeitsanweisung){
      this.alle_unterlagen_vorhanden.emit(true)
    }else{
      this.alle_unterlagen_vorhanden.emit(false)
    }
  }
  //#endregion
  //#region selection
  /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
  isAllSelected() {
    return UtilFormular.isAllSelected(this.selection, this.unterlagen.data.length); 
  }

  /** Alle Zeilen auswaehlen oder abwaehlen */
  toggleAllRows() {
    UtilFormular.toggleAllRows(this.selection, this.unterlagen.data.length, this.unterlagen);
  }
  //#endregion
  
  //#region Sonstiges
  zurueck(){
    if(this.bestellungID){
      this.router.navigate(UtilUrl.bestellungen.bestellungen)
    }else{
      this.router.navigate(UtilUrl.angebote.angebote)
    }
  }

  weiter(){
    this.router.navigate(UtilUrl.angebote.leiterplatte(this.bgnr, this.aunr))
  }
  //#endregion
}
