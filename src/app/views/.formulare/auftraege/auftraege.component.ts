import { Component, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';

import { Auftrag } from 'src/app/interfaces/auftrag';
import { Baugruppe } from 'src/app/interfaces/baugruppe';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';
import { getTrigger } from 'src/app/services/table.service'

import { UtilFormular } from 'src/app/utils/util.formular';
import { UtilDialog } from 'src/app/utils/util.dialog';
import { UtilUrl } from 'src/app/utils/util.url';
import { Router } from '@angular/router';
import { DialogComponent } from '../../.children/dialog/dialog.component';
import { filter, take, tap } from 'rxjs';
import { UtilStripe } from 'src/app/utils/util.stripe';

export interface AngepassterAuftrag { // Angular Material Table kann nur Arrays erkennen, die keine verschachtelte Objekte besitzt. 
  id: string;
  bgnrkd: string;
  bgbezeichnungkd: string;
  slok: string;
  prok: string;
  auftragsart: string;
  wunschtermin: string;
  absendetermin: string;
  antworttermin: string;
  gesamtkosten: string;
  lztage: string;
  liefertermin: string;
}

@Component({
  selector: 'mpl-auftraege',
  templateUrl: './auftraege.component.html',
  styleUrls: ['./auftraege.component.scss'],
  animations: getTrigger
})

export class AuftraegeComponent {
  filterAll: string = ""

  columnsToDisplay = [
    'select', 'aunr', 'bgnrkd', 'aubezeichnung', 'slpositionen', 'auftragsmenge', "loeschen"
  ];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: AngepassterAuftrag | null | undefined;

  auftraege: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  selection: any = new SelectionModel<any>(true, []);

  baugruppen: any[] = []
  baugruppen_json_format: any = {}

  kbauftragsart: any[] = []
  kbwunschtermin: any[] = []

  formated_kbauftragsart: any[] = []
  formated_kbwunschtermin: any[] = []

  kosten: any[] = []

  slide_toggle: boolean = false;

  spinning: boolean = false;
  bereit: boolean = false;
  bitte_warten_speichern: boolean = false;
  bitte_warten_kostenermittlung: boolean = false;

  bitte_warten_angebot_bestellen: boolean = false;

  jetzt: Date
  jetzt_intervalId: any;

  date_funktion: Function = (date:string)=> new Date(date);

  constructor(
    private backend: BackendService,
    private mitteilungService: MitteilungService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.jetzt = new Date()
    this.jetzt_intervalId = setInterval(() => this.jetzt = new Date(), 1000);
  }

  ngOnInit(): void {
    this.GetFormFields();
    this.GetBaugruppen();

    this.GetAuftraege();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
    clearInterval(this.jetzt_intervalId);
  }

  //#region Get
  GetBaugruppen(): void {
    let subscription = this.backend.GetBaugruppen().subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.baugruppen = value;
        for (let x of value) {
          let tmp_value = { ...x }
          let tmp_bgnr = tmp_value['bgnr']
          delete tmp_value['bgnr']
          this.baugruppen_json_format[tmp_bgnr] = tmp_value
        }
      }
    });
  }
  GetAuftraege(aunr:number|string|undefined = undefined) {
    if(!aunr){
      this.bereit = false;
    }

    let subscription = this.backend.GetAuftraege(aunr, false).subscribe((value) => {
      subscription.unsubscribe();

      this.bereit = true;
      
      if (value !== false) {
        if(aunr){
          const find_auftrag = this.auftraege.data.findIndex((value:any)=>value.aunr == aunr);
          if(find_auftrag > -1){
            this.auftraege.data[find_auftrag] = value[0];
          }
        }else{
          this.auftraege = new MatTableDataSource(value);
        }

        this.auftraege._updateChangeSubscription();

        this.auftraege.paginator = this.paginator;
      }
    });
  }
  GetFormFields() {
    let subscription = this.backend.GetFormFields("MPLAuftraege").subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.kbauftragsart = value.auftragsart
        this.kbwunschtermin = value.wunschtermin

        let tmp_auftragsart: any = {}
        value.auftragsart?.forEach((x: any) => {
          tmp_auftragsart[x.value] = {
            name: x.name,
            sort: x.sort,
            sprache: x.sprache,
            standard: x.standard
          };
        });
        this.formated_kbauftragsart = tmp_auftragsart

        let tmp_wunschtermin: any = {}
        value.wunschtermin?.forEach((x: any) => {
          tmp_wunschtermin[x.value] = {
            name: x.name,
            sort: x.sort,
            sprache: x.sprache,
            standard: x.standard
          }
        });
        this.formated_kbwunschtermin = tmp_wunschtermin
      }
    });
  }
  //#endregion
  //#region Update, Delete
  Update(tmpAuftrag: any) {
    // finde die ausgewählte Baugruppe durch bgnr bzw die ID der Baugruppe
    let baugruppe = this.getAusgewaehlteBaugruppe(tmpAuftrag.bgnr)

    let auftrag: any = {
      aunr: tmpAuftrag.aunr,
      bgnr: baugruppe.bgnr,
      slok: tmpAuftrag.slok,
      prok: tmpAuftrag.prok,
      auftragsmenge: tmpAuftrag.auftragsmenge,
      auftragsart: tmpAuftrag.auftragsart,
      wunschtermin: tmpAuftrag.wunschtermin,
      absendetermin: tmpAuftrag.absendetermin,
      antworttermin: tmpAuftrag.antworttermin,
      gesamtkosten: tmpAuftrag.gesamtkosten,
      lztage: tmpAuftrag.lztage,
      liefertermin: tmpAuftrag.liefertermin,
      letzteaenderungzpkt: tmpAuftrag.letzteaenderungzpkt,
      anlagezeitpunkt: tmpAuftrag.anlagezeitpunkt,
      aubemerkungkd: tmpAuftrag.aubemerkungkd,
      mplanfrage: tmpAuftrag.mplanfrage
    }

    this.bitte_warten_speichern = true;

    let subscription = this.backend
      .UpdateAuftraeg(auftrag)
      .subscribe((value) => {
        subscription.unsubscribe();

        if (value !== false) {
          this.GetAuftraege(value);
          //this.mitteilungService.createMessage("Auftrag wurde erfolgreich aktualisiert", "success");
        }

        this.bitte_warten_speichern = false;
      });
  }

  loeschen(
    event: Event | null,
    auftrag: any = null
  ) {
    if(event){
      event.stopPropagation()
    }

    let length: number
    let auftrag_name: string
    if(auftrag){
      length = 1
      auftrag_name = auftrag?.aunr
    }else{
      length = this.selection.selected.length
      auftrag_name = this.selection.selected[0].aunr
    }

    let titel: string;
    let content: string;
    if(length > 1){
      titel = length + " Auftrag Löschen";
      content = "Wollen Sie wirklich die " + length + " Auftrag unwiderruflich löschen?"
    }else{
      titel = "Auftrag '" + auftrag_name + "' Löschen";
      content = "Wollen Sie wirklich den Auftrag unwiderruflich löschen?"
    }

    UtilDialog.loeschenBestaetigen(
      this.dialog
      , titel
      , content
    ).then(()=>{
      if(auftrag === null){
        UtilFormular.loopAngularMaterialTableSelection(
          this.selection
          , (element: any, resolve: any, reject: any)=>{
            let subscription2 = this.backend
              .DeleteAuftraeg(element.aunr)
              .subscribe((value) => {
                subscription2.unsubscribe();
                if (value !== false) {
                  UtilFormular.loescheZeileDurchObject(this.auftraege, element);
                  
                  //this.mitteilungService.createMessage("Auftrag wurde erfolgreich gelöscht", "success")
                }

                resolve(true)
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
          .DeleteAuftraeg(auftrag.aunr)
          .subscribe((value) => {
            subscription2.unsubscribe();
            if (value !== false) {
              UtilFormular.loescheZeileDurchObject(this.auftraege, auftrag);
              
              //this.mitteilungService.createMessage("Auftrag wurde erfolgreich gelöscht", "success")
            }
          });
      }
    })
  }
  //#endregion
  //#region Formular Funktionen
  setBGNRKD(element: any, event: any) {
    // finde die ausgewählte Baugruppe durch bgnrkd
    let ausgewaehlteBaugruppe = this.getAusgewaehlteBaugruppe(event.target.value)

    // ändere die zu verändernden Auftrag mit dem ausgewählten Baugruppe
    element.bgnr = ausgewaehlteBaugruppe?.bgnr
    element.bgnrkd = ausgewaehlteBaugruppe?.bgnrkd
    element.bgbezeichnungkd = ausgewaehlteBaugruppe?.bgbezeichnungkd
  }
  getAusgewaehlteBaugruppe(bgnr: any) {
    // finde die ausgewählte Baugruppe durch bgnrkd
    let indexBaugruppe = this.baugruppen.findIndex(x => x.bgnr == bgnr)
    return this.baugruppen[indexBaugruppe]
  }

  change_date(date: string, mit_Uhrzeit: boolean = true) {
    if (date) {
      if (mit_Uhrzeit) {
        return new Date(date).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      } else {
        return new Date(date).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }
    } else {
      return ""
    }
  }

  change_preise(preis: number) {
    let rounded_number = Math.round(preis * 100) / 100
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
      rounded_number
    )
  }

  add_Lieferzeit(lieferzeit: number | undefined, value: number) {
    if (lieferzeit) return lieferzeit + value
    return "";
  }

  get_bgnrkd(bgnr: any){
    const baugruppe = this.baugruppen.find((value: any) => value.bgnr == bgnr)
    
    if(baugruppe && baugruppe?.bgnrkd){
      return baugruppe.bgnrkd
    }else{
      return null
    }
  }

  get_wunschtermin(wunschtermin: any){
    const gefundener_wunschtermin = this.kbwunschtermin.find((value: any)=> value.value == wunschtermin)

    if(gefundener_wunschtermin && gefundener_wunschtermin?.name){
      return gefundener_wunschtermin.name
    }else{
      return null
    }
  }
  //#endregion
  //#region Berechnung
  Preisermittlung(aunr: any, bgnr: any) {
    this.spinning = true;
    this.bitte_warten_kostenermittlung = true;

    let kalkulation = (tmp_aunr: any) => {
      let subscription1 = this.backend.ZeitKalkulation(tmp_aunr).subscribe((value) => {
        subscription1.unsubscribe();

        if (value !== false) {
          let subscription2 = this.backend.MaterialKalkulation(tmp_aunr).subscribe((value) => {
            subscription2.unsubscribe();

            this.spinning = false;
            this.bitte_warten_kostenermittlung = false;

            if (value !== false) {
              this.GetAuftraege()
            }
          });
        }
      });
    }


    
    if (this.slide_toggle) {// Mit Quellen Aktualisieren und Leiterplatten Anfrage
      // ---------------------------------- Quellen aktualisieren -----------------------------------

      let subscription0 = this.backend.QuellenAktualisierenNew("AUNR", aunr, 0, 0, "").subscribe((value) => {
        subscription0.unsubscribe();

        if (value !== false) {
          // ------------------------------ Leiterplatten Anfrage -----------------------------------
          let subscription = this.backend.leiterplatteanfragen(bgnr, aunr).subscribe((value) => {
            subscription.unsubscribe();

            if (value !== false) {
              // -------------------------- Material und Zeit Kalkulation ---------------------------
              kalkulation(aunr);
            }else{
              this.spinning = false;
            }
          });

        }
      })
    } else {// ohne Quellen Aktualisieren und Leiterplatten Anfrage
      kalkulation(aunr);
    }
  }
  //#endregion
  //#region umleitung
  ViewBaugruppe(): void {
    this.router.navigate(UtilUrl.baugruppen.baugruppen)
  }
  
  ViewLeiterplattendaten(auftrag: any): void {
    this.router.navigate(UtilUrl.angebote.leiterplatte(auftrag.bgnr, auftrag.aunr))
  }
  ViewAuftragsStueckliste(auftrag: any): void {
    this.router.navigate(UtilUrl.angebote.bom(auftrag.bgnr, auftrag.aunr))
  }
  Umleiten_nach_Dateien(auftrag: any): void{
    this.router.navigate(UtilUrl.angebote.unterlagen(auftrag.bgnr, auftrag.aunr))
  }
  Umleiten_nach_vergleich(auftrag: any): void {
    this.router.navigate(UtilUrl.angebote.vergleichen(auftrag.bgnr, auftrag.aunr))
  }
  Umleiten_nach_zusammenfassung(auftrag: any): void {
    this.router.navigate(UtilUrl.angebote.zusammenfassung(auftrag.bgnr, auftrag.aunr))
  }
  Umleiten_nach_angebot_bestaetigen(auftrag: any): void {
    this.router.navigate(UtilUrl.angebote.bestaetigen(auftrag.bgnr, auftrag.aunr))
  }

  Umleiten_nach_checkout(element: any){
    let subscription0 = this.backend.FristPruefen(element.aunr).subscribe((value) => {
      subscription0.unsubscribe();

      if(value !== false){
        if (value) {
          UtilStripe.checkout(
            this.backend
            , this.dialog
            , element.aunr
            , element
            , ()=>{
              this.bitte_warten_angebot_bestellen = true;
            }
            , (value: any)=>{
              if(value !== false){
                if(value?.checkout?.url){
                  window.location.href = value?.checkout?.url;
                }
              }
      
              this.bitte_warten_angebot_bestellen = false;
            },()=>{
              this.bitte_warten_angebot_bestellen = false;
            }
          );
        }else{
          const dialogRef = this.dialog.open(DialogComponent, {
            width: '500px',
            data: {
              titel: "Angebot neu Kalkulieren",
              content: "Das Angebot ist nicht mehr verfügbar, wollen Sie ein neues Angebot kalkulieren?" ,
              ja_button_content: "Neu Kalkulieren",
              ja_button_style: "success",
              nein_button_exist_not: true
            }
          });

          let subscribe1 = dialogRef.afterClosed().pipe(
            take(1),
            filter((result: any) => result != undefined),   // Abbrechen
            tap((result: any) => {                          // ja: true; nein: false;
              subscribe1.unsubscribe();
    
              if(result){
                this.router.navigate(UtilUrl.neuesAngebot.neues_angebot(element.bgnr))
              }
            })
          ).subscribe();
        }
      }
    })
  }
  
  //#endregion
  //#region filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.auftraege.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
  //#region selection
  /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
  isAllSelected() {
    return UtilFormular.isAllSelected(this.selection, this.auftraege.data.length); 
  }

  /** Alle Zeilen auswaehlen oder abwaehlen */
  toggleAllRows() {
    UtilFormular.toggleAllRows(this.selection, this.auftraege.data.length, this.auftraege);
  }
  //#endregion
  //#region download
  ExcelOderPdfDownload(aunr: string | number, excel: boolean){
    let subscription = this.backend.DownloadAuftragsStuecklisteExcelOderPDF(
      aunr,
      excel
    ).subscribe((value) => {
      subscription.unsubscribe();
    });
  }
  //#endregion


  

}
