import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { BackendService } from 'src/app/services/backend.service';

import { Methoden } from 'src/app/interfaces/methoden';

@Component({
  selector: 'mpl-globale-bauteil-suche',
  templateUrl: './globale-bauteil-suche.component.html',
  styleUrl: './globale-bauteil-suche.component.scss'
})
export class GlobaleBauteilSuche {
  @Input() neues_projekt = false;
  @Input() methode!: Methoden;

  @Input() sticky: boolean = false;
  @Input() background_anpassen: boolean = false;
  @Output() lade_status: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() btnr!: number | string;
  @Input() bgnr!: number | string;


  @Input() linamekd!: any;

  @Output() bauteil_ausgewaehlt = new EventEmitter<any>();
  @Output() abbrechen = new EventEmitter<boolean>();

  @Input() globale_bauteile!: any[];

  @Input() gesamtmenge!: number;

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  // Globale Bauteil suche durch API Anfrage
  form_bauteilbeschreibung: FormGroup = this._formBuilder.group({
    suche_bauteilbeschreibung: [
      '', 
      [ Validators.required ]
    ]
  })
  form_mpn: FormGroup = this._formBuilder.group({
    suche_mpn: [
      '', 
      [ Validators.required ]
    ]
  })
  form_sku: FormGroup = this._formBuilder.group({
    suche_sku: [
      '', 
      [ 
        Validators.required
      ]
    ],
    linr: [
      '', 
      []
    ],
  })
  ValueChangesSubscripton: Subscription | undefined;

  loading_such_ergebnis:boolean = false;

  letzte_suche_beschreibung: string | undefined;
  letzte_suche_mpn: string | undefined;
  letzte_suche_sku: string | undefined;

  

  constructor(
    private backend: BackendService,
    private _formBuilder: FormBuilder
  ) {
    this.form_sku?.get('linr')?.disable();
    this.ValueChangesSubscripton = this.form_sku?.get('suche_sku')?.valueChanges.subscribe((value: any)=>{
      if(!value || value == ""){
        this.form_sku?.get('linr')?.patchValue("")
        this.form_sku?.get('linr')?.disable();
      }else{
        this.form_sku?.get('linr')?.enable();
      }
    });
  }

  ngOnInit(){

  }

  //#region Get
  
  //#endregion
  //#region suche
  ManuelleSucheAlternativeBauteile(){
    this.lade_status.emit(true);

    this.loading_such_ergebnis = true;

    const btbeschreibung = this.form_bauteilbeschreibung?.get('suche_bauteilbeschreibung')?.value 
    const htnr = this.form_mpn?.get('suche_mpn')?.value 
    const btnrli = this.form_sku?.get('suche_sku')?.value 
    const linr = this.form_sku?.get('linr')?.value 

    let baugruppenmenge: number = 1;
    if(this.neues_projekt){
      baugruppenmenge = +(localStorage.getItem("baugruppenmenge") ?? 1);
    }
    
    this.letzte_suche_beschreibung = btbeschreibung;
    this.letzte_suche_mpn          = htnr;
    this.letzte_suche_sku          = btnrli;

    switch(this.methode){
      case Methoden.IMPORT:
      case Methoden.BAUTEIL_SUCHEN:
        let subscription_AlternativeAngebenImport = this.backend
          .AlternativeAngebenImport( btbeschreibung, htnr, btnrli, linr, baugruppenmenge ).subscribe((value) => {
            subscription_AlternativeAngebenImport.unsubscribe();
            this.loading_such_ergebnis = false;
            this.lade_status.emit(false);

            if (value !== false && value !== null) {
              this.globale_bauteile  = value;
            }else{
              this.globale_bauteile  = [];
            }
          }, (error) => {
            console.error(error)
            this.loading_such_ergebnis = false;
            this.lade_status.emit(false);
          });
      break;
      case Methoden.BAUGRUPPE:
        let subscription_AlternativeAngebenBaugruppe = this.backend
          .AlternativeAngebenBaugruppe( this.btnr, this.bgnr, baugruppenmenge, htnr, btnrli, btbeschreibung, linr ).subscribe((value) => {
            subscription_AlternativeAngebenBaugruppe.unsubscribe();
            this.loading_such_ergebnis = false;
            this.lade_status.emit(false);

            if (value !== false && value !== null) {
              this.globale_bauteile  = value;
            }else{
              this.globale_bauteile  = [];
            }
          }, (error) => {
            console.error(error)
            this.loading_such_ergebnis = false;
            this.lade_status.emit(false);
          });
      break;
      case Methoden.BAUTEILE:
        let subscription_AlternativeAngebenBauteil = this.backend
          .AlternativeAngebenBauteil( this.btnr, this.bgnr, baugruppenmenge, htnr, btnrli, btbeschreibung, linr ).subscribe((value) => {
            subscription_AlternativeAngebenBauteil.unsubscribe();
            this.loading_such_ergebnis = false;
            this.lade_status.emit(false);

            if (value !== false && value !== null) {
              this.globale_bauteile  = value;
            }else{
              this.globale_bauteile  = [];
            }
          }, (error) => {
            console.error(error)
            this.loading_such_ergebnis = false;
            this.lade_status.emit(false);
          });
      break;
      default:
        this.loading_such_ergebnis = false
        this.lade_status.emit(false);
        break;
    }
  }
  //#endregion
  //#region Formular Funktionen
  sku_check_if_empty(){
    let sku = this.form_sku?.get('suche_sku')?.value
    if(!sku || sku.trim() == ""){
      const linr = this.form_sku?.get('linr')?.patchValue(undefined) 
    } 
  }

  bauteil_auswaehlen(bauteil: any){
    this.bauteil_ausgewaehlt.emit(bauteil);
  }

  beenden(){
    this.abbrechen.emit(true);
  }
  //#endregion

}
