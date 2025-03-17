import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { BackendService } from 'src/app/services/backend.service';

import { MitteilungService } from 'src/app/services/mitteilung.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.scss']
})
export class ViewMenuComponent {
  bereit: boolean = false;

  produktion_frontend: boolean | undefined = undefined;
  produktion_backend: boolean | undefined = undefined;

  kundenNrAuswaehlenAktiv: boolean | undefined = undefined;

  kdnr: string|number = this.GetKDNR();
  array_kdnr: any[] = []

  getLetzteAenderung_angular: string = "";
  getLetzteAenderung_php: string = "";

  production: boolean = environment.production;

  constructor(
    private router: Router,
    private backendService: BackendService,
    private mitteilungService: MitteilungService,
    private keycloak: KeycloakService,
    private dialog: MatDialog,
    ) {}

  ngOnInit(){
    Promise.all([
      this.GetKunden()
      , this.getLetzteAenderung()
      , this.getProduktion()
      , this.getKundenNrAuswaehlenAktiv()
    ]).then(()=> this.bereit = true)
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetKunden(): Promise<any>{
    return new Promise((resolve, reject)=>{
      let subscription = this.backendService.GetKunden().subscribe((value) => {
        subscription.unsubscribe();
        if (value === false) {
          //! Fehlermeldung
          console.log('Get Kunden Fehler');
          //this.mitteilungService.createMessage("Kunden konnten nicht geladen werden", "danger")
          this.mitteilungService.createMessageDialog("Kunden konnten nicht geladen werden")
          reject();
        } else {
          this.array_kdnr = value;
          resolve(true)
        }
      }, (error)=>{
        console.error(error)
        reject(error);
      });
    })
  }
  getLetzteAenderung(): Promise<any>{
    return new Promise((resolve, reject)=>{
      this.backendService.getLetzteAenderung().pipe(take(1)).subscribe((value)=>{
        this.getLetzteAenderung_angular = value['angular']
        this.getLetzteAenderung_php = value['php']
        resolve(true)
      }, (error)=>{
        console.error(error)
        reject(error);
      })
    })
  }
  getProduktion(): Promise<any>{
    return new Promise((resolve, reject)=>{
      this.produktion_frontend = environment.production; 
      this.backendService.getProduktion().pipe(take(1)).subscribe((value)=>{
        if(value !== false){
          this.produktion_backend = value['produktion'];
          resolve(true)
        }else{
          reject();
        }
      },(error)=>{
        console.error(error)
        reject(error);
      })
    })
  }
  getKundenNrAuswaehlenAktiv(): Promise<any>{
    return new Promise((resolve, reject)=>{
      this.backendService.getKundenNrAuswaehlenAktiv().pipe(take(1)).subscribe((value)=>{
        if(value !== false){
          this.kundenNrAuswaehlenAktiv = value['kdnr_auswaehlen'];
          resolve(true)
        }else{
          reject()
        }
      },(error)=>{
        console.error(error)
        reject(error)
      })
    })
  }
  //#endregion
  //#region Umleitung
  Umleitung_nach_neues_projekt_anlegen(){
    this.router.navigate(UtilUrl.neuesProjekt.neues_projekt)
  }
  Umleitung_nach_bauteil_suche(){
    this.router.navigate(UtilUrl.bauteil_suche)
  }
  Umleitung_nach_import(){
    this.router.navigate(UtilUrl.import.import)
  }
  Umleitung_nach_kundenbauteil(){
    this.router.navigate(UtilUrl.kundenbauteil.kundenbauteil)
  }
  Umleitung_nach_baugruppen(){
    this.router.navigate(UtilUrl.baugruppen.baugruppen)
  }
  Umleitung_nach_auftraege(){
    this.router.navigate(UtilUrl.angebote.angebote)
  }
  Umleitung_nach_bestellungen(){
    this.router.navigate(UtilUrl.bestellungen.bestellungen)
  }
  //#endregion

  changeKunde(){
    localStorage.setItem("kdnr", this.kdnr.toString() );
    this.backendService.kundennummer = this.kdnr
    location.reload()
  }

  GetKDNR(){
    return this.backendService.kundennummer
  }


}
