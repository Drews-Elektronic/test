import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take, tap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { KeycloakService } from 'keycloak-angular';

import { BackendService } from "../../../services/backend.service"
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { environment } from 'src/environments/environment';

import { DialogComponent } from 'src/app/views/.children/dialog/dialog.component';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  bereit: boolean = false;

  @ViewChild('box') box!: ElementRef<HTMLDivElement>;
  isExpanded = false;

  produktion_frontend: boolean | undefined = undefined;
  produktion_backend: boolean | undefined = undefined;

  kundenNrAuswaehlenAktiv: boolean | undefined = undefined;

  keycloak_deaktiviert: boolean = environment.keycloak_deaktivieren;

  kdnr: string|number = this.GetKDNR();
  array_kdnr: any[] = []

  getLetzteAenderung_angular: string = "";
  getLetzteAenderung_php: string = "";

  username : string = "";



  constructor(
    private route: Router,
    private backendService: BackendService,
    private mitteilungService: MitteilungService,
    private keycloak: KeycloakService,
    private dialog: MatDialog,
  ){}

  ngOnInit(): void {
    if(!this.keycloak_deaktiviert){
      this.keycloak.getToken().then((token: any) =>{
        if(token){
          this.user_daten();
        }
      })
    }

    let promise: Promise<any>[] = []

    promise.push(this.GetKunden())
    promise.push(this.getLetzteAenderung())
    promise.push(this.getProduktion())
    promise.push(this.getKundenNrAuswaehlenAktiv())

    Promise.all(promise).then(()=> this.bereit = true)
  }

  //#region KeyCloak Funktionen 
  user_daten(){
    this.keycloak.loadUserProfile().then((profile) => {
      if((profile.firstName != undefined && profile.firstName != "") && profile.lastName != undefined && profile.lastName != ""){
        this.username = profile.firstName + " " + profile.lastName;
      }else if(profile.username){
        this.username = profile.username;
      }
    })
  }

  personal_info(){
    const url = environment.keycloak.protocol + environment.keycloak.url + "/realms/" + environment.keycloak.realm + "/account/#/personal-info";
    window.open(url, '_blank');
  }

  logout(){
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        titel: "Wollen Sie sich wirklich abmelden?",
        ja_button_content: "Ja",
        ja_button_style: "success",
        nein_button_exist_not: true
      }
    });
    
    let subscribe1 = dialogRef.afterClosed().pipe(
      take(1),
      filter((result: any) => result != undefined),   // Abbrechen
      tap((result: any) => {                          // ja: true; nein: false;
        subscribe1.unsubscribe();
        this.keycloak.logout( environment.protocol + environment.homeUrl + environment.mplUrl )
      })
    ).subscribe();
  }
  //#endregion
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
  GetKDNR(){
    return this.backendService.kundennummer
  }
  //#endregion
  //#region Umleitung
  kundendaten(){
    this.route.navigate(UtilUrl.kunden.kundendaten)
  }
  //#endregion
  //#region Animation
  toggle(): void {
    const box = this.box.nativeElement;

    if (this.isExpanded) {
      // Collapse the box
      box.style.height = `${box.scrollHeight}px`; // Start at the current height
      requestAnimationFrame(() => {
        box.style.height = '0'; // Animate to 0
      });
    } else {
      // Expand the box
      box.style.height = `${box.scrollHeight}px`; // Set the height to the content's scrollHeight
      box.addEventListener(
        'transitionend',
        () => {
          // Ensure height is set to auto after the transition
          box.style.height = 'auto !important';
        },
        { once: true }
      );
    }

    // Toggle the state
    this.isExpanded = !this.isExpanded;
  }
  //#endregion
}
