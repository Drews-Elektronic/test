import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';

import { Methoden } from 'src/app/interfaces/methoden';

import { Beistellung } from 'src/app/enum/beistellung';

import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { UtilUrl } from 'src/app/utils/util.url';
import { UtilValidator } from 'src/app/utils/util.validator';

import { DialogComponent } from '../../.children/dialog/dialog.component';

@Component({
  selector: 'mpl-bauteil-suche',
  templateUrl: './bauteil-suche.component.html',
  styleUrl: './bauteil-suche.component.scss'
})
export class BauteilSucheComponent {
  bereit: boolean = false;
  loading_Globale_Suche: boolean = false;

  linamekd: any[] = []
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

  @ViewChild('stepper') stepper!: MatStepper

  bgnr: any
  slnr: any

  methode_bauteil_suchen = Methoden.BAUTEIL_SUCHEN

  BauteilAuswaehlenFormGroup: FormGroup = this._formBuilder.group({
    bauteil: ['', [
      Validators.required
    ]],
  });

  BauteilHinzufuegenFormGroup: FormGroup = this._formBuilder.group({
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

  
  

  constructor(
    private backend: BackendService, 
    private router : Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private mitteilungService: MitteilungService
  ){
    // Füge Validators hinzu
    this.BauteilAuswaehlenFormGroup = this._formBuilder.group({
      bauteil: ['', Validators.required]
    });

    this.BauteilHinzufuegenFormGroup?.get("htnrkd")?.addValidators(
      UtilValidator.htnrkd_oder_btnrlikd_required(this.BauteilHinzufuegenFormGroup)
    )
    this.BauteilHinzufuegenFormGroup?.get("btnrlikd")?.addValidators(
      UtilValidator.btnrlikd_oder_htnrkd_required(this.BauteilHinzufuegenFormGroup),
    )
    this.BauteilHinzufuegenFormGroup?.get("linamekd")?.addValidators(
      UtilValidator.linamekd_required_wenn_btnrlikd_gesetzt(this.BauteilHinzufuegenFormGroup)
    )
    this.BauteilHinzufuegenFormGroup.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.GetLieferanten();
    this.GetFehlermeldungen()
    this.GetFormFields();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
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
  //#region Bauteil suchen
  lade_status_aktualisieren(event: any){
    if(event === true){
      this.loading_Globale_Suche = true;
    }else{
      this.loading_Globale_Suche = false;
    }
  }
  //#endregion
  //#region Bauteil
  BauteilSpeichern(element: any){
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
            this.setBauteilAuswaehlenFormGroup(element)

            this.stepper.next()
          }
      });
    }
  }

  Bauteilhinzufuegen(){
    let subscription = this.backend.AddBauteil(this.BauteilHinzufuegenFormGroup.getRawValue()).subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.stepper.selectedIndex = 0;
      }
    });
  }
  //#endregion
  //#region Formular
  onStepChange(stepper: StepperSelectionEvent): void {
    if (stepper.selectedIndex === 0) {
      // Wenn der Benutzer wieder zum ersten Schritt zurück geht, soll das Form wieder zum invalid Status 
      this.setBauteilAuswaehlenFormGroup("")
    }else if (stepper.selectedIndex === 1) {
      const bauteil = this.BauteilAuswaehlenFormGroup.get("bauteil")?.value;

      //this.formGroup.get("btnrkd")?.patchValue(bauteil[''])
      this.BauteilHinzufuegenFormGroup.get("btbeschreibungkd")?.patchValue(bauteil['btqbeschreibung'])
      this.BauteilHinzufuegenFormGroup.get("htnrkd")?.patchValue(bauteil['htnr'])
      this.BauteilHinzufuegenFormGroup.get("htnhkd")?.patchValue(bauteil['htnh'])
      this.BauteilHinzufuegenFormGroup.get("linr")?.patchValue(bauteil['linr'])
      this.BauteilHinzufuegenFormGroup.get("btnrlikd")?.patchValue(bauteil['btnrli'])
      this.BauteilHinzufuegenFormGroup.get("linamekd")?.patchValue(bauteil['lieferant'])
      //this.formGroup.get("btbemerkungkd")?.patchValue(bauteil[''])
      //this.formGroup.get("bgnrkd")?.patchValue(bauteil[''])
      //this.formGroup.get("bompos")?.patchValue(bauteil[''])
      //this.formGroup.get("anzprobg")?.patchValue(bauteil[''])
      //this.formGroup.get("elbez")?.patchValue(bauteil[''])
      //this.formGroup.get("slbemerkungkd")?.patchValue(bauteil[''])

      this.BauteilHinzufuegenFormGroup.get("agbskd")?.patchValue(Beistellung.BESCHAFFUNG)
      this.BauteilHinzufuegenFormGroup.get("aglakd")?.patchValue(0)
      this.BauteilHinzufuegenFormGroup.get("aghakd")?.patchValue(0)

    }
  }
  //#endregion
  //#region Umleitung
  zurueck(){
    this.router.navigate(UtilUrl.home)
  }
  //#endregion
  //#region sonstiges
  private setBauteilAuswaehlenFormGroup(value: any){
    this.BauteilAuswaehlenFormGroup.get("bauteil")?.setValue(value);
    this.BauteilAuswaehlenFormGroup.updateValueAndValidity();
  }

  private getBauteilAuswaehlenFormGroup(): any{
    return this.BauteilAuswaehlenFormGroup.get("bauteil")?.value;
  }

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
    this.BauteilHinzufuegenFormGroup?.get("linr")?.patchValue(linr);
    this.BauteilHinzufuegenFormGroup?.get("linamekd")?.patchValue(linamekd);
  }
  //#endregion

}
