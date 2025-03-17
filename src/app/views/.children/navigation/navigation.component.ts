import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take, tap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { DialogComponent } from 'src/app/views/.children/dialog/dialog.component';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  @Input() baugruppen: boolean = false;

  @Input() auftraege: boolean = false;

  @Input() neues_projekt: boolean = false;
  
  @Input() neuer_auftrag: boolean = false;

  @Input() import_zeile_anlegen: boolean = false;

  @Input() kundenbauteil_anlegen: boolean = false;
  
  @Input() bestellung: boolean = false;

  @Input() aunr: any;
  @Input() bgnr: any;
  @Input() name: any;
  @Input() bestellungID: any;

  @Input() position: number = 0;

  @Input() alle_nav_anwendbar: boolean = false;

  navigation: string[] = [];
  umleitung!: Function;

  nummerierung: boolean = false;

  navigationen_baugruppen: string[] = [
    "My Leiterplatte"
    ,"My BOM"
  ]

  navigationen_auftraege: string[] = [
    "My Daten"
    ,"My Leiterplatte"
    ,"My BOM"
    ,"My BOM vergleichen"
    //,"My Zusammenfassung"
    //,"My Angebot"
  ]

  navigationen_neues_projekt: string[] = [
    "Neues Projekt"
    ,"BOM hochladen"
    ,"Leiterplatte"
    ,"BOM prüfen"
    ,"BOM vergleichen"
    ,"Zusammenfassung"
    ,"Angebot"
  ]

  navigationen_auftrag_anlegen: string[] = [
    "Menge angeben"
    ,"Leiterplatte"
    ,"BOM prüfen"
    ,"BOM vergleichen"
    ,"Zusammenfassung"
    ,"Angebot"
  ]
  
  navigationen_import_zeile_anlegen: string[] = [
    "Import Bauteil anlegen"
  ]

  navigationen_kundenbauteil_anlegen: string[] = [
    "Neues Bauteil anlegen"
  ]

  navigationen_bestellungen: string[] = [
    "My Leiterplatte"
    ,"My BOM"
    // ,"My Daten"
  ]

  constructor(
    //private router: Router,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(){
    if(this.neues_projekt){
      this.navigation =  this.navigationen_neues_projekt;
      this.umleitung = this.umleitung_neues_projekt;
      this.nummerierung = true;
    }else if(this.neuer_auftrag){
      this.navigation =  this.navigationen_auftrag_anlegen;
      this.umleitung = this.umleitung_neuer_auftrag;
      this.nummerierung = true;
    }else if(this.bestellung){
      this.navigation =  this.navigationen_bestellungen;
      this.umleitung = this.umleitung_bestellungen;

      this.alle_nav_anwendbar = true;
    }else if(this.auftraege){
      this.navigation =  this.navigationen_auftraege;
      this.umleitung = this.umleitung_auftraege;

      this.alle_nav_anwendbar = true;
    }else if(this.baugruppen){
      this.navigation =  this.navigationen_baugruppen;
      this.umleitung = this.umleitung_baugruppen;
      
      this.alle_nav_anwendbar = true;
    }else if(this.import_zeile_anlegen){
      this.navigation =  this.navigationen_import_zeile_anlegen;
      this.umleitung = (index:any)=>{};
    }else if(this.kundenbauteil_anlegen){
      this.navigation =  this.navigationen_kundenbauteil_anlegen;
      this.umleitung = (index:any)=>{};
    }
  }

  //#region Umleitungen
  umleitung_neues_projekt(index: number = 0){
    switch(index){
      case 0:
        if(1 < this.position){
          const dialogRef = this.dialog.open(DialogComponent, {
            width: '600px',
            data: {
              titel: "Wollen Sie wirklich eine neue Baugruppe erstellen?",
              content: "Wenn Sie zu '(1) Neues Projekt' zurückgehen, kann die derzeitige Baugruppe im Hauptmenü in 'My Baugruppen' wieder gefunden werden.",
              ja_button_content: "Nach Neues Projekt",
              ja_button_style: "success",
              nein_button_exist_not: true
            }
          });
          
          let subscription1 = dialogRef.afterClosed().pipe(
            take(1),
            filter((result: any) => result != undefined),   // Abbrechen
            tap((result: any) => {                          // ja: true; nein: false;
              subscription1.unsubscribe();
    
              this.router.navigate(UtilUrl.neuesProjekt.neues_projekt)

            })
        ).subscribe();
        }else{
          this.router.navigate(UtilUrl.neuesProjekt.neues_projekt)
        }
        break;
      case 1:
        if(1 < this.position){
          const dialogRef = this.dialog.open(DialogComponent, {
            width: '600px',
            data: {
              titel: "Wollen Sie wirklich eine neue Baugruppe erstellen?",
              content: "Wenn Sie zu '(2) BOM hochladen' zurückgehen, kann die derzeitige Baugruppe im Hauptmenü in 'My Baugruppen' wieder gefunden werden.",
              ja_button_content: "Nach BOM hochladen",
              ja_button_style: "success",
              nein_button_exist_not: true
            }
          });
          
          let subscription1 = dialogRef.afterClosed().pipe(
            take(1),
            filter((result: any) => result != undefined),   // Abbrechen
            tap((result: any) => {                          // ja: true; nein: false;
              subscription1.unsubscribe();
    
              this.router.navigate(UtilUrl.neuesProjekt.import);
            })
          ).subscribe();
        }else{
          this.router.navigate(UtilUrl.neuesProjekt.import);
        }
        break;
      case 2:
        this.router.navigate(UtilUrl.neuesProjekt.leiterplatte(this.bgnr))
        break;
      case 3:
        this.router.navigate(UtilUrl.neuesProjekt.bom(this.bgnr))
        break;
      case 4:
        this.router.navigate(UtilUrl.neuesProjekt.vergleichen(this.bgnr, this.aunr))
        break;
      case 5:
        this.router.navigate(UtilUrl.neuesProjekt.zusammenfassung(this.bgnr, this.aunr))
        break;
      case 6:
        this.router.navigate(UtilUrl.neuesProjekt.bestaetigen(this.bgnr, this.aunr))
        break;
    }
  }
  umleitung_neuer_auftrag(index: number = 0){
    switch(index){
      case 0:
        this.router.navigate(UtilUrl.neuesAngebot.neues_angebot(this.bgnr))
        break;
      case 1:
        this.router.navigate(UtilUrl.neuesAngebot.leiterplatte(this.bgnr))
        break;
      case 2:
        this.router.navigate(UtilUrl.neuesAngebot.bom(this.bgnr))
        break;
      case 3:
        this.router.navigate(UtilUrl.neuesAngebot.vergleichen(this.bgnr, this.aunr))
        break;
      case 4:
        this.router.navigate(UtilUrl.neuesAngebot.zusammenfassung(this.bgnr, this.aunr))
        break;
      case 5:
        this.router.navigate(UtilUrl.neuesAngebot.bestaetigen(this.bgnr, this.aunr))
        break;
    }
  }
  umleitung_auftraege(nr: number){
    if(nr === 0){
      this.router.navigate(UtilUrl.angebote.unterlagen(this.bgnr, this.aunr))
    }else if(nr === 1){
      this.router.navigate(UtilUrl.angebote.leiterplatte(this.bgnr, this.aunr))
    }else if(nr === 2){
      this.router.navigate(UtilUrl.angebote.bom(this.bgnr, this.aunr))
    }else if(nr === 3){
      this.router.navigate(UtilUrl.angebote.vergleichen(this.bgnr, this.aunr))
    }else if(nr === 4){
      this.router.navigate(UtilUrl.angebote.zusammenfassung(this.bgnr, this.aunr))
    }else if(nr === 5){
      this.router.navigate(UtilUrl.angebote.bestaetigen(this.bgnr, this.aunr))
    }
  }
  umleitung_baugruppen(nr: number){
    if(nr === 0){
      this.router.navigate(UtilUrl.baugruppen.leiterplatte(this.bgnr))
    }else if(nr === 1){
      this.router.navigate(UtilUrl.baugruppen.bom(this.bgnr))
    }
  }
  umleitung_bestellungen(nr: number){
    if(nr === 0){
      this.router.navigate(UtilUrl.bestellungen.leiterplatte(this.bestellungID))
    }else if(nr === 1){
      this.router.navigate(UtilUrl.baugruppen.bom(this.bgnr))
    }else if(nr === 2){
      this.router.navigate(UtilUrl.bestellungen.unterlagen(this.bestellungID))
    }
  }
  //#endregion
  //#region zurueck
  zurueck_auftraege(){
    this.router.navigate(UtilUrl.angebote.angebote)
  }

  zurueck_baugruppen(){
    this.router.navigate(UtilUrl.baugruppen.baugruppen)
  }

  zurueck_import(){
    this.router.navigate(UtilUrl.import.import)
  }

  zurueck_kundenbauteil(){
    this.router.navigate(UtilUrl.kundenbauteil.kundenbauteil)
  }

  zurueck_bestellungen(){
    this.router.navigate(UtilUrl.bestellungen.bestellungen);
  }
  //#endregion
}
