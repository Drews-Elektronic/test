import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BauteilOptionStatus } from 'src/app/enum/bauteilOptionenStatus';
import { Beistellung } from 'src/app/enum/beistellung';
import { QuellenStatus } from 'src/app/enum/quellen-status';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';


@Component({
  selector: 'mpl-auftraege-stueckliste-vergleich',
  templateUrl: './auftraege-stueckliste-vergleich.component.html',
  styleUrl: './auftraege-stueckliste-vergleich.component.scss',
})
export class AuftraegeStuecklisteVergleichComponent {
  neues_projekt: boolean = false;
  neuer_auftrag: boolean = false;

  bereit: boolean = false;
  dauertLange: boolean = false;

  bgnr: any;
  aunr: any;

  bgnrkd: string | undefined;

  ErsteColoums: Array<string> = ["soll", "btbeschreibungkd",   "htnrkd",   "htnhkd",   "btnrlikd",   "linamekurzkd",   "elbezkomp", "leer-anzprobgkomp", "leer-gesamtmenge", "soll-lieferzeit", "technDaten"    ];
  ZweiteColoums: Array<string> =["ist",  "ist-btbeschreibung", "ist-htnr", "ist-htnh", "ist-btnrli", "ist-linamekurz", "leer",      "ist-anzprobgkomp",  "ist-gesamtmenge",  "ist-lieferzeit",  "ist-technDaten"];

  auftrag: any[] = [];
  auftragsstuecklisten: any[] = [];

  // Enums
  QuellenStatus = QuellenStatus
  Beistellung = Beistellung
  BauteilOptionStatus = BauteilOptionStatus

  constructor(
    private backend: BackendService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mitteilungService: MitteilungService
  ) {
    if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
      this.neues_projekt = true;
    }else if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
      this.neuer_auftrag = true;
    }

    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
    this.aunr = this.activatedRoute.snapshot.paramMap.get('aunr');
  }

  ngOnInit(): void {
    this.GetAuftrag()

    setTimeout(()=>{
      if(!this.bereit){
        this.dauertLange = true;
      }
    }, 60000)
  }

  ngOnDestroy(){
    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetAuftrag(keine_quellen_aktualisieren: boolean = false) {
    this.bereit = false;

    let subscription = this.backend
      .GetAuftraege(this.aunr)
      .subscribe((value: any) => {
        subscription.unsubscribe();
        
        if (value !== false) {
          this.bgnrkd = value[0].bgnrkd;
          this.auftrag = value;

          if(
              ( 
                (
                  !this.neues_projekt
                  && !this.neuer_auftrag
                )
                || value[0].bestellt != 0
              ) || keine_quellen_aktualisieren
          ){
            this.GetAuftragStuecklisteMitBQ()
          }else{
            this.quellen_aktualisieren();
          }
        }
      });
  }
  
  GetAuftragStuecklisteMitBQ() {
    this.bereit = false;

    let subscription1 = this.backend
      .GetAuftragStuecklisteMitBQ(this.aunr)
      .subscribe((value: any) => {
        subscription1.unsubscribe();

        if (value !== false) {
          this.auftragsstuecklisten = value
        }
        this.bereit = true;
      });
  }
  //#endregion
  //#region Update
  
  //#endregion
  //#region Quellen
  quellen_aktualisieren() {
    this.bereit = false;

    if(this.aunr && this.bgnr){
      let subscription0 = this.backend.QuellenAktualisierenNew("AUNR", this.aunr, this.auftrag[0].auftragsmenge, 0, "", false).subscribe((value) => {
        subscription0.unsubscribe();

        if (value !== false) {
          let subscription1 = this.backend.ZeitKalkulation(this.aunr, false).subscribe((value) => {
            subscription1.unsubscribe();
    
            if (value !== false) {
              let subscription2 = this.backend.MaterialKalkulation(this.aunr, false).subscribe((value) => {
                subscription2.unsubscribe();
    
                if (value !== false) {
                  this.GetAuftrag(true)
                }
              });
            }
          });
        }
      })
    }else{
      this.bereit = true;
    }
  }

  alternative_suche(event: any, element: any){
    event.stopPropagation(); // Verhindert den Click-Event vom Eltern-Element
    
    if( (element.anzprobgkomp * element.auftragsmenge) > 0 ){
      localStorage.setItem("bauteil", JSON.stringify(element))
      this.navigateZumAlternativenBauteilSuchen(element.slnr)
    }
  }

  navigateZumAlternativenBauteilSuchen(slnr: any){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.vergleichen_alternativ(this.bgnr, this.aunr))
    }else if(this.neuer_auftrag){
      this.router.navigate(UtilUrl.neuesAngebot.vergleichen_alternativ(this.bgnr, this.aunr))
    }else{
      //this.router.navigate(UtilUrl.angebote.leiterplatte(this.bgnr, this.aunr))
    }
  }
  //#endregion
  //#region umleitung
  weiter(){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.zusammenfassung(this.bgnr, this.aunr))
    }else if(this.neuer_auftrag){
      this.router.navigate(UtilUrl.neuesAngebot.zusammenfassung(this.bgnr, this.aunr))
    }else{
      this.router.navigate(UtilUrl.angebote.zusammenfassung(this.bgnr, this.aunr))
    }
  }

  zurueck(){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.bom(this.bgnr))
    }else if(this.neuer_auftrag){
      this.router.navigate(UtilUrl.neuesAngebot.bom(this.bgnr))
    }else{
      this.router.navigate(UtilUrl.angebote.bom(this.bgnr, this.aunr))
    }
  }
  //#endregion
}





