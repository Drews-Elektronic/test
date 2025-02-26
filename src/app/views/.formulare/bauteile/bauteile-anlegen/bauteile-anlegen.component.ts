import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Methoden } from 'src/app/interfaces/methoden';

import { BackendService } from 'src/app/services/backend.service';

import { UtilValidator } from 'src/app/utils/util.validator';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-bauteile-anlegen',
  templateUrl: './bauteile-anlegen.component.html',
  styleUrls: ['./bauteile-anlegen.component.scss']
})
export class BauteileAnlegenComponent {
  formGroup: FormGroup = this._formBuilder.group({
    btnrkd:           ['', []],
    btbeschreibungkd: ['', [
      Validators.required
    ]],
    htnrkd:           ['', [ // Entweder htnrkd oder btnrlikd erforderlich
      // Validator wird in constructor hinzugefügt! 
    ]],
    agbtkd:           ['', []],
    htnhkd:           ['', []],
    agbskd:           ['', []],
    linr:             ['', []],
    aglakd:           ['', []],
    btnrlikd:         ['', [ // Entweder htnrkd oder btnrlikd erforderlich
      // Weiterer Validator wird in constructor hinzugefügt! 
    ]],
    aghakd:           ['', []],
    linamekd:         ['', [ // Wenn btnrlikd verwendet wird, ist das hier required
      // Validator wird in constructor hinzugefügt! 
    ]],
    btbemerkungkd:    ['', []]
  });

  fehlermeldung: any;
  
  //Noch zu ändern: agstkd
  agstkd: any[] = [
    {name: "", value:"0"},
    {name: "SMD", value:"1"},
    {name: "THT", value:"2"},
  ]

  agbtkd: any[] = []
  aglakd: any[] = []
  aghakd: any[] = []
  agbskd: any[] = []

  linamekd: any[] = []

  radiobutton_pos : number = 1;

  methode_bauteil: Methoden = Methoden.BAUTEILE

  lade_status_AlternativeSpeichernBauteil: boolean = false;
  bitte_warten_hinzufuegen: boolean = false;

  constructor(
    private backend: BackendService,
    private router: Router,
    private location: Location,
    private _formBuilder: FormBuilder
  ) {
    // Füge Validators hinzu
    this.formGroup?.get("htnrkd")?.addValidators(
      UtilValidator.htnrkd_oder_btnrlikd_required(this.formGroup)
    )
    this.formGroup?.get("btnrlikd")?.addValidators(
      UtilValidator.btnrlikd_oder_htnrkd_required(this.formGroup),
    )
    this.formGroup?.get("linamekd")?.addValidators(
      UtilValidator.linamekd_required_wenn_btnrlikd_gesetzt(this.formGroup)
    )
    this.formGroup.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.GetFormFields();
    this.GetLieferanten();
    this.GetFehlermeldungen()
  }

  //#region Get
  GetLieferanten(){
    let subscription = this.backend.GetLieferant().subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.linamekd = value;
        }
    });
  }

  GetFormFields(){
    let subscription = this.backend.GetFormFields("MPLBauteilPoolZeile").subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.agbskd = value.agbs
        this.agbtkd = value.agbt
        this.aghakd = value.agha
        this.aglakd = value.agla
        //this.agstkd = value.agst
      }
    });
  }

  GetFehlermeldungen(){
    let subscription = this.backend.ImportFehlermeldungen().subscribe((value:any) => {
        subscription.unsubscribe();

        if(value !== false){
          this.fehlermeldung = {}
          value.forEach((element: any) => {
            let text = "";
            if(element['degrund']){
              text += element['degrund'] + "! ";
            }
            if(element['detext']){
              text += element['detext'] + ". ";
            }
            if(element['detodo']){
              text += element['detodo'] + ". ";
            }

            this.fehlermeldung[element['menr']] = text;
          });
        }
    });
  }
  //#endregion
  //#region Add
  BauteilAnlegen(){
    this.bitte_warten_hinzufuegen = true;

    let subscription = this.backend.AddBauteil(this.formGroup.getRawValue()).subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.router.navigate(UtilUrl.kundenbauteil.kundenbauteil) // Durch die Umleitung, wird die Meldung nicht angezeigt.
      }

      this.bitte_warten_hinzufuegen = false;
    });
  }
  //#endregion
  //#region Bauteil suchen
  globales_bauteil_auswaehlen(bauteil: any){
    //this.formGroup.get("btnrkd")?.patchValue(bauteil[''])
    this.formGroup.get("btbeschreibungkd")?.patchValue(bauteil['btqbeschreibung'])
    this.formGroup.get("htnrkd")?.patchValue(bauteil['htnr'])
    this.formGroup.get("htnhkd")?.patchValue(bauteil['htnh'])
    this.formGroup.get("linr")?.patchValue(bauteil['linr'])
    this.formGroup.get("btnrlikd")?.patchValue(bauteil['btnrli'])
    this.formGroup.get("linamekd")?.patchValue(bauteil['lieferant'])
    //this.formGroup.get("btbemerkungkd")?.patchValue(bauteil[''])
    //this.formGroup.get("bgnrkd")?.patchValue(bauteil[''])
    //this.formGroup.get("bompos")?.patchValue(bauteil[''])
    //this.formGroup.get("anzprobg")?.patchValue(bauteil[''])
    //this.formGroup.get("elbez")?.patchValue(bauteil[''])
    //this.formGroup.get("slbemerkungkd")?.patchValue(bauteil[''])

    this.radiobutton_pos = 1;

    /*
    let subscription = this.backend.AlternativeSpeichernBauteil(bauteil['bqnr']).subscribe((value: any) => {
      subscription.unsubscribe();

      this.router.navigate(UtilUrl.kundenbauteil.kundenbauteil)
    });
    */
  }

  lade_status_aktualisieren(event: any){
    if(event === true){
      this.lade_status_AlternativeSpeichernBauteil = true;
    }else{
      this.lade_status_AlternativeSpeichernBauteil = false;
    }
  }
  //#endregion
  //#region sonstiges
  lieferant_change(event: any){
    // finde die ausgewählte Baugruppe durch bgnrkd
    if(!this.linamekd){
      return
    }
    if(!event.target || !event.target.value){
      return
    }
    let ausgewaehlteLieferant: any = this.linamekd.findIndex(x => x.LINR == event.target.value);
    
    const linr     = this.linamekd[ausgewaehlteLieferant]['LINR'];
    const linamekd = this.linamekd[ausgewaehlteLieferant].Lieferantenname;

    // ändere die zu verändernden Auftrag mit dem ausgewählten Baugruppe
    this.formGroup?.get("linr")?.patchValue(linr);
    this.formGroup?.get("linamekd")?.patchValue(linamekd);
  }

  zurueck(){
    this.router.navigate(UtilUrl.kundenbauteil.kundenbauteil)
  }
  //#endregion
}
