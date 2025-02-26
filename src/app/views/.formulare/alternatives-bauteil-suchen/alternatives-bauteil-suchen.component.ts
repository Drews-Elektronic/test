import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { MatDialog } from '@angular/material/dialog';

import { DialogComponent } from '../../.children/dialog/dialog.component';

import { Methoden } from 'src/app/interfaces/methoden';
import { Beistellung } from 'src/app/enum/beistellung';
import { UtilUrl } from 'src/app/utils/util.url';


@Component({
  selector: 'mpl-alternatives-bauteil-suchen',
  templateUrl: './alternatives-bauteil-suchen.component.html',
  styleUrl: './alternatives-bauteil-suchen.component.scss'
})
export class AlternativesBauteilSuchenComponent {
  bereit: boolean = false;

  neues_projekt: boolean = false;
  neuer_auftrag: boolean = false;

  bgnr: any
  slnr: any
  baugruppenmenge: any

  bgnrkd: string | undefined;

  bauteil: any;

  routeSub: any;

  
  // Automatische Suche 
  alternative_bauteile_tabelle_daten: any[] = [];

  gestartet_unsere_vorschlaege: boolean = false;
  loading_unsere_vorschlaege:boolean = false;


  // Manuelle Suche
  loading_AlternativeAngebenBaugruppe:boolean = false;
  methode_baugruppe = Methoden.BAUGRUPPE


  linr: any; // ausgewählter Lieferant

  fehlermeldungen: any = { // Später die Fehlermeldungen in der SQL Datenbank verschieben. Mit verschiedenen Sprachen. (So wie 'linamekd')
    "required-arbeitsblatt": "Wählen Sie ein Arbeitsblatt aus!",

    "required-kopfzeile": "Geben Sie eine Zeile an!",
    "numberAndAboveZero-kopfzeile": "Es sind nur Werte erlaubt, die größer als 0 sind!",
    "nichtVorhanden-kopfzeile": "Die Zeile konnte nicht gefunden werden!",
    
    "required-datenbereich_von": "Geben Sie eine Zeile an!",
    "numberAndAboveZero-datenbereich_von": "Es sind nur Werte erlaubt, die größer als 0 sind!",
    "nichtVorhanden-datenbereich_von": "Die Zeile konnte nicht gefunden werden!",
    
    "numberAndAboveZero-datenbereich_bis": "Es sind nur Werte erlaubt, die größer als 0 sind!",
    "nichtVorhanden-datenbereich_bis": "Die Zeile konnte nicht gefunden werden!"
  }
  linamekd: any[] = []

  selectedRadioButton: boolean = true;

  constructor(
    private backend: BackendService, 
    private router : Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private mitteilungService: MitteilungService
  ) {
    
    if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
      this.neues_projekt = true;
    }
    if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
      this.neuer_auftrag = true;
    }

    this.baugruppenmenge = localStorage.getItem("baugruppenmenge")

    this.routeSub = this.route.params.subscribe(params => {
      this.bgnr = params?.['bgnr'];
      this.slnr = params?.['slnr'];

      if(!this.bauteil && !this.baugruppenmenge){
        this.zurueck();
      }
    });
  }

  ngOnInit(): void {
    Promise.all([
      this.GetLieferanten()
      , this.GetStueckliste()
    ]).then(()=>{
      this.bereit = true;
    })
  }

  ngOnDestroy(){
    this.routeSub.unsubscribe();

    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetLieferanten(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.GetLieferant().subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.linamekd = value;
          resolve(true);
        }else{
          resolve(false);
        }
      }, (error: any)=>{
        subscription.unsubscribe();
        console.error(error)
        resolve(false)
      });
    })
  }

  GetStueckliste() {
    return new Promise((resolve, reject) => {
      // Füge Spinning in die Objekte ein
      let subscription = this.backend
      .GetStueckliste(this.bgnr, undefined, this.slnr)
      .subscribe((value) => {
        subscription.unsubscribe();

        if (value !== false) {
          // Füge Spinning in die Objekte ein
          this.bauteil = value[0];
        }

        resolve(value ?? false);
      }, (error: any) => {
        console.log(error)

        subscription.unsubscribe();
        resolve(false);
      });
    });
  }
  //#endregion
  //#region Bauteil suchen
  AutomatischeSucheAlternativeBauteile(){
    this.loading_unsere_vorschlaege = true;
    this.gestartet_unsere_vorschlaege = true;

    let subscription1 = this.backend
      .SucheMitSkuUndMpnAlternativeBauteile(this.bgnr, this.bauteil.btnr, this.baugruppenmenge)
      .subscribe((value) => {
        subscription1.unsubscribe();
        
        this.loading_unsere_vorschlaege = false;

        if (value && value !== false) {
          this.alternative_bauteile_tabelle_daten  = value;
        }else{
          this.alternative_bauteile_tabelle_daten = [];
        }
      });
  }

  lade_status_aktualisieren(event: any){
    if(event === true){
      this.loading_AlternativeAngebenBaugruppe = true;
    }else{
      this.loading_AlternativeAngebenBaugruppe = false;
    }
  }
  //#endregion
  //#region Bauteil
  AlternativesBauteilSpeichern(element: any){
    if(element){
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '500px',
        data: {
          titel: "Alternatives Bauteil auswählen",
          content: "Wollen Sie das Bauteil mit der Beschreibung '" + element.btqbeschreibung + "' und der Hersteller-Teile Nr. '" + element.htnr + "' auswählen!" ,
          ja_button_content: "Auswählen",
          ja_button_style: "success",
          nein_button_exist_not: true
        }
      });

      dialogRef.afterClosed()
        .pipe(
          take(1),
          filter((result: any) => result != undefined) // abbrechen: undefined
        )
        .subscribe((result: any) => { // ja: true; nein: false;
          if(result){
            let subscription2 = this.backend
              .AlternativesBauteilSpeichern(this.bgnr, this.slnr, element.bqnr, this.baugruppenmenge)
              .subscribe((value) => {
                subscription2.unsubscribe();
                if (value !== false) {

                  const tmp_bauteil = {...this.bauteil}
                  tmp_bauteil.agbskd = Beistellung.BESCHAFFUNG;
                  let subscription = this.backend
                    .UpdateStuecklistenzeile(tmp_bauteil, this.bgnr)
                    .subscribe((value) => {
                      subscription.unsubscribe();
                      
                      if (value !== false) {
                        this.backend
                          .QuellenAktualisierenNew("SLNR", 1, 0, this.slnr, "", 0, this.baugruppenmenge)
                          .pipe(take(1))
                          .subscribe((value: any) => {
                            if(value !== false){
                              this.zurueck()
                            }
                          });
                      }
                    });
                }
              });
          }
      });
    }
  }
  //#endregion
  //#region Formular
  
  //#endregion
  //#region Umleitung
  zurueck(){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.bom(this.bgnr))
    }else if(this.neuer_auftrag){
      this.router.navigate(UtilUrl.neuesAngebot.bom(this.bgnr))
    }else{
      this.router.navigate(UtilUrl.baugruppen.bom(this.bgnr))
    }
  }
  //#endregion
}
