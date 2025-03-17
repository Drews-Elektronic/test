import { Component, Inject, Input, ViewChild  } from '@angular/core';
import { Router } from '@angular/router';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Methoden } from 'src/app/interfaces/methoden';

import { UtilValidator } from 'src/app/utils/util.validator'; 

@Component({
  selector: 'mpl-import-bauteil-anlegen',
  templateUrl: './import-bauteil-anlegen.component.html',
  styleUrls: ['./import-bauteil-anlegen.component.scss']
})
export class ImportBauteilAnlegenComponent  {
  @Input() neues_projekt: boolean = false;

  bereit_bestehende_bt: boolean = false;

  // Noch zu ändern: agstkd
  agstkd: any[] = [
    {name: "", value:"0"},
    {name: "SMD", value:"1"},
    {name: "THT", value:"2"},
  ]

  aglakd: any[] = []
  aghakd: any[] = []
  agbskd: any[] = []
  agbtkd: any[] = []

  bestehende_bauteil_spalten: string[] = ['btnrkd', 'btbeschreibungkd', 'htnrkd', 'htnhkd', 'btnrlikd', 'linamekd', 'technDaten', 'auswaehlen']
  bestehende_bauteile: MatTableDataSource<any> = new MatTableDataSource();
  bestehende_bauteile_length: number = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  lade_status_AlternativeAngebenImport: boolean = false
  bitte_warten_hinzufuegen: boolean = false;

  linamekd: any[] | undefined = []

  radiobutton_pos : number = 1;

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
    btbemerkungkd:    ['', []],
    bgnrkd:           ['', []],
    bompos:           ['', []],
    anzprobg:         ['', [
      Validators.required,
      Validators.min(1)
    ]],
    elbez:            ['', [
      Validators.required
    ]],
    slbemerkungkd:    ['', []],
  });

  fehlermeldung: any;

  methode_import = Methoden.IMPORT

  constructor(
    private backend: BackendService,
    private router: Router,
    private mitteilungService: MitteilungService,
    private location: Location,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ImportBauteilAnlegenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialog_daten_entnehmen()

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

  ngOnInit(){
    this.GetFormFields()
    this.GetLieferanten()
    this.GetFehlermeldungen()
    this.GetBestehendeBauteile()
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetFormFields(){
    let subscription = this.backend.GetFormFields("MPLBauteilPoolZeile").subscribe((value) => {
      subscription.unsubscribe();
      if (value === false) {
        //! Fehlermeldung
        console.log('GetBaugruppen Fehler');
        //this.mitteilungService.createMessage("Baugruppen konnten nicht geladen werden", "danger")
        this.mitteilungService.createMessageDialog("Baugruppen konnten nicht geladen werden")
      } else {
        this.agbskd = value.agbs
        this.agbtkd = value.agbt
        this.aghakd = value.agha
        this.aglakd = value.agla
      }
    });
  }

  GetLieferanten(){
    let subscription = this.backend.GetLieferant().subscribe((value) => {
      subscription.unsubscribe();
      if (value === false) {
        //! Fehlermeldung
        console.log('GetBaugruppen Fehler');
        //this.mitteilungService.createMessage("Baugruppen konnte nicht geladen werden", "danger")
        this.mitteilungService.createMessageDialog("Baugruppen konnte nicht geladen werden")
      } else {
        this.linamekd = value;
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

  GetBestehendeBauteile(){
    this.bereit_bestehende_bt = false;

    let subscription = this.backend.GetBauteile().subscribe((value:any) => {
      subscription.unsubscribe();

      if(value !== false){
        this.bestehende_bauteile.data = value;
        this.bestehende_bauteile_length = value.length;
        this.bestehende_bauteile.paginator = this.paginator;

        this.bestehende_bauteile._updateChangeSubscription()

        this.bereit_bestehende_bt = true;
      }
    });
  }
  //#endregion
  //#region create
  ImportBauteilAnlegen(){
    this.bitte_warten_hinzufuegen = true;

    let subscription = this.backend.ImportBauteilAnlegen(this.formGroup?.getRawValue()).subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.dialog_beenden(true)
      }

      this.bitte_warten_hinzufuegen = false;
    });
  }
  //#endregion
  //#region Formular Funktionen
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

  bestehendes_bauteil_auswaehlen(bauteil: any){
    Object.entries(bauteil).forEach(([key, value]) => {
      const formControl = this.formGroup.get(key);
      if (formControl) {
        formControl.setValue(value);
      }
    });

    this.radiobutton_pos = 1;
  }

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
    let subscription = this.backend.AlternativeSpeichernImportAnlegen(bauteil['bqnr']).subscribe((value: any) => {
      subscription.unsubscribe();

      this.dialog_beenden(true)
    });
    */

  }
  //#endregion
  //#region Bauteil suchen
  lade_status_aktualisieren(event: any){
    if(event === true){
      this.lade_status_AlternativeAngebenImport = true;
    }else{
      this.lade_status_AlternativeAngebenImport = false;
    }
  }
  //#endregion
  //#region filter
  applyFilter_bestehende_bt(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.bestehende_bauteile.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
  //#region umleitung
  zurueck(){ // wird nicht verwendet, weil die Komponente als ein Dialog verwendet wird.
    this.location.back();
  }
  //#endregion
  //#region dialog
  dialog_daten_entnehmen(){
    if(this.data.neues_projekt){
      this.neues_projekt = this.data.neues_projekt;
    }
  }

  dialog_beenden(neuladen: boolean = false): void {
    this.dialogRef.close(neuladen);
  }
  //#endregion
  
}
