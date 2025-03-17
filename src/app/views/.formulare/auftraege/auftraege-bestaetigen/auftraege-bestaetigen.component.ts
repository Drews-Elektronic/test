import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';
import { PdfViewerComponent } from 'src/app/views/.children/pdf-viewer/pdf-viewer.component';
import { UtilStripe } from 'src/app/utils/util.stripe';
import { UtilCountdown } from 'src/app/utils/util.countdown';

@Component({
  selector: 'mpl-auftraege-bestaetigen',
  templateUrl: './auftraege-bestaetigen.component.html',
  styleUrl: './auftraege-bestaetigen.component.scss'
})
export class AuftraegeBestaetigenComponent {
  neues_projekt: boolean = false;
  neuer_auftrag: boolean = false;

  bereit: boolean = false;
  bitte_warten_angebot_bestaetigen: boolean = false;

  bgnr: any;
  aunr: any;

  bgnrkd: string | undefined;

  pdf?: Blob;

  // Daten
  kdnr: any;
  kundendaten: any;
  auftraege: any[] = [];

  // Tabelle
  coloums_angebot: Array<string> = [ "bompos", "bgnr", "bgnrkd", "auftragsmenge", "wunschliefertermin", "kostenprobg_netto", "gesamtkosten_netto", "pdf" ];
  footer_coloums_netto: Array<string> = [ "footer_beschreibung_netto", "footer_gesamtkosten_netto" ];
  footer_coloums_mwst: Array<string> = [ "footer_beschreibung_MwSt", "MwSt" ];
  footer_coloums_brutto: Array<string> = [ "footer_beschreibung_brutto", "footer_gesamtkosten_brutto" ];
  tabellen_daten_angebot: MatTableDataSource<any> = new MatTableDataSource();

  // Kundendaten
  coloums_kunden: Array<string> = [ "hauptdaten", "rechnungsadresse", "lieferadresse", "drewsadresse" ];
  tabellen_daten_kunden: any = [
    {
      firma: ""
      , "kundennr": 250041
      , kundentel: 11111111
      , Kundenemail: "test@test.de"
    }
  ];

  // Datum
  heute: Date = new Date();

  // Fristzeit
  UtilCountdown: UtilCountdown = new UtilCountdown();
  angebot_ist_abgelaufen: boolean = true;
  intervalId: any

  constructor(
    private backend: BackendService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private mitteilungService: MitteilungService
  ) {
    if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
      this.neues_projekt = true;
    }else if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
      this.neuer_auftrag = true;
    }

    this.aunr = this.activatedRoute.snapshot.paramMap.get('aunr');
    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
  }

  ngOnInit(){
    Promise.all([
      this.GetAngebotDaten(this.aunr)
      , this.GetKundendaten()
    ]).then(()=>{
      this.bereit = true;
    })
  }

  ngOnDestroy(){
    this.mitteilungService.closeMessage();

    this.UtilCountdown.clearInterval();
    clearInterval(this.intervalId);
  }

  //#region Get
  GetKundendaten(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .GetKundendaten()
        .subscribe((value) => {
          subscription.unsubscribe()

          if (value === false) {
            //! Fehlermeldung
            console.log('GetKunde Fehler');

            this.mitteilungService.createMessageDialog("Kunde konnte nicht geladen werden")
          } else {
            this.kundendaten = value;
          }

          resolve(true)
        }, (error)=>{
          console.error(error)
          resolve(false)
        });
    })
    
  }

  GetAngebotDaten(aunr: number | string){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .GetAngebotDaten(aunr)
        .subscribe((value: any) => {
          subscription.unsubscribe();

          if (value !== false) {
            if(Array.isArray(value.auftraege)){
              this.auftraege = value.auftraege

              if(this.intervalId === undefined){
                this.UtilCountdown.startCountdown(value.auftraege[0].fristdatum);
                this.intervalId = setInterval(() => this.angebot_ist_abgelaufen = this.UtilCountdown.istAbgelaufen(), 1000);
              }
              
            }else{
              this.auftraege = [];
            }

            this.tabellen_daten_angebot = new MatTableDataSource(this.auftraege);
          
            if(typeof value.auftraege === "object"){
              this.bgnrkd = value.auftraege[0].bgnrkd
            }
          }
          

          resolve(true)
        },(error)=>{
          console.error(error);
          resolve(false);
        });
    });
  }
  //#endregion
  //#region Update
  
  //#endregion
  //#region Weiter
  angebot_checkout(){
    UtilStripe.checkout(
      this.backend
      , this.dialog
      , this.aunr
      , this.auftraege[0]
      , ()=>{
        this.bitte_warten_angebot_bestaetigen = true;
      }, (value: any)=>{
        console.log(value)

        if(value !== false){
          if(value?.checkout?.url){
            window.location.href = value?.checkout?.url;
          }
        }

        this.bitte_warten_angebot_bestaetigen = false;
      },()=>{
        this.bitte_warten_angebot_bestaetigen = false;
      }
    );
  }
  //#endregion
  //#region PDF
  PDF_anzeigen(){
    const dialogRef = this.dialog.open(PdfViewerComponent, {
      data: {
        aunr: this.aunr,
        heute: this.heute
      }
    });
    
    let subscription1 = dialogRef.afterClosed().pipe(
      take(1),
      filter((result: any) => result != undefined),   // Abbrechen
      tap((result: any) => {                          // ja: true; nein: false;
        subscription1.unsubscribe();
      })
    ).subscribe();
  }
  //#endregion
  //#region Umleitung
  zurueck(){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.zusammenfassung(this.bgnr, this.aunr))
    }else if(this.neuer_auftrag){
      this.router.navigate(UtilUrl.neuesAngebot.zusammenfassung(this.bgnr, this.aunr))
    }else{
      this.router.navigate(UtilUrl.angebote.zusammenfassung(this.bgnr, this.aunr))
    }
  }
  //#endregion
  //#region sonstiges
  getGesamtpreisNettoVonAllenAngeboten(){
    let gesamtpreis = 0;
    const daten = this.tabellen_daten_angebot.data

    for (let index = 0; index < daten.length; index++) {
      const element = daten[index];
      
      gesamtpreis += element['gesamtkosten']
    }

    return gesamtpreis
  }

  getGesamtpreisBruttoVonAllenAngeboten(){
    let gesamtpreis = 0;
    const daten = this.tabellen_daten_angebot.data

    for (let index = 0; index < daten.length; index++) {
      const element = daten[index];
      
      gesamtpreis += element['gesamtkosten_brutto']
    }

    return gesamtpreis
  }
  //#endregion
}
