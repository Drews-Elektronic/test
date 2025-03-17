import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

@Component({
  selector: 'mpl-kundendaten',
  templateUrl: './kundendaten.component.html',
  styleUrls: ['./kundendaten.component.scss']
})
export class KundendatenComponent implements OnInit {
  form: FormGroup = this._formBuilder.group({
    kdnr: [
      '', 
      [ 
        Validators.required
      ],
      
    ],
    firma: [
      ''
    ],
    anrede: [
      '', 
      [ 
        Validators.required
      ]
    ],
    firstName: [
      '', 
      [ 
        Validators.required
      ]
    ],
    lastName: [
      '', 
      [ 
        Validators.required
      ]
    ],
    strasse: [
      '', 
      [ 
        Validators.required
      ]
    ],
    plz: [
      '', 
      [ 
        Validators.required,
        Validators.pattern('\\d+')
      ]
    ],
    ort: [
      '', 
      [ 
        Validators.required
      ]
    ],
    land: [
      '', 
      [ 
        Validators.required
      ]
    ],
    email: [
      '', 
      [ 
        Validators.required,
        Validators.email
      ]
    ],
    tel: [
      '', 
      [ 
        Validators.required,
        Validators.pattern('^[- +()0-9]+$')
      ]
    ],
    
    andereLieferadresse: [
      false
    ],
    lianrede: [
      ''
    ],
    lifirstName: [
      ''
    ],
    lilastName: [
      ''
    ],
    listrasse: [
      ''
    ],
    liplz: [
      '', 
      [ 
        Validators.pattern('\\d+')
      ]
    ],
    liort: [
      ''
    ],
    liland: [
      ''
    ],
    limail: [
      '', 
      [ 
        Validators.email
      ]
    ],
    litel: [
      '', 
      [ 
        Validators.pattern('^[- +()0-9]+$')
      ]
    ],
    andereRechnungsadresse: [
      false
    ],
    reanrede: [
      ''
    ],
    refirstName: [
      ''
    ],
    relastName: [
      ''
    ],
    restrasse: [
      ''
    ],
    replz: [
      '', 
      [ 
        Validators.pattern('\\d+')
      ]
    ],
    reort: [
      ''
    ],
    reland: [
      ''
    ],
    remail: [
      '',
      [
        Validators.email
      ]
    ],
    retel: [
      '', 
      [ 
        Validators.pattern('^[- +()0-9]+$')
      ]
    ],
    versandart: [
      ''
    ],
    rechnungsversand: [
      ''
    ],

    sprache: [
      ''
    ],
    waehrung: [
      ''
    ],
    ustidnr: [
      ''
    ]
  })

  getSuccess: boolean = false;
  updateSuccess: boolean = false;

  bitte_warten: boolean = true;
  bitte_warten_aktualisieren: boolean = false;

  constructor(
    private backend: BackendService,
    private mitteilungService: MitteilungService,
    private location: Location,
    private _formBuilder: FormBuilder
  ) {
    this.form?.get('kdnr')?.disable();
  }

  ngOnInit(): void {
    this.GetKunde();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetKunde() {
    this.bitte_warten = true;

    let subscription = this.backend.GetKundendaten().subscribe((value) => {
      if (value === false) {
        //! Fehlermeldung
        console.log('GetKunde Fehler');
        this.getSuccess = false;
        //this.mitteilungService.createMessage("Kunde konnte nicht geladen werden", "danger")
        this.mitteilungService.createMessageDialog("Kunde konnte nicht geladen werden")
      } else {
        subscription.unsubscribe();

        for (const key1 in value) {
          if (Object.prototype.hasOwnProperty.call(value, key1)) {
            const element1 = value[key1];
            
            if(typeof element1 !== "object"){
              this.form.get(key1)?.patchValue(element1)
            }else{
              for (const key2 in element1) {
                if (Object.prototype.hasOwnProperty.call(element1, key2)) {
                  const element2 = element1[key2];
                  
                  this.form.get(key2)?.patchValue(element2)
                }
              }
            }
          }
        }
        
        this.bitte_warten = false;
        this.getSuccess = true;
      }
    }, (error)=>{
      console.error(error)
      this.bitte_warten_aktualisieren = false;
    });
  }
  //#endregion
  //#region Update
  UpdateKunde() {
    this.bitte_warten_aktualisieren = true;

    let subscription = this.backend.UpdateKunde(this.form.getRawValue()).subscribe((value) => {
      this.bitte_warten_aktualisieren = false;
      
      if (value === false) {
        //! Fehlermeldung
        console.log('UpdateKunde Fehler');
        this.updateSuccess = false;
        //this.mitteilungService.createMessage("Kunde konnte nicht aktualisiert werden", "danger")
        this.mitteilungService.createMessageDialog("Kunde konnte nicht aktualisiert werden")
      } else {
        subscription.unsubscribe();
        this.updateSuccess = true;
        //this.mitteilungService.createMessage("Kunde wurde erfolgreich aktualisiert", "success")
      }
    }, (error)=>{
      console.error(error)
      this.bitte_warten_aktualisieren = false;
    });
  }
  //#endregion
  //#region Checkbox
  check_checkbox_andereLieferadresse(){
    return this.form.get('andereLieferadresse')?.value == 'true'
  }

  check_checkbox_andereRechnungsadresse(){
    return this.form.get('andereRechnungsadresse')?.value == 'true'
  }

  update_checkbox_andereLieferadresse(checked: boolean){
    this.form.get('andereLieferadresse')?.patchValue(checked ? 'true' : 'false')
  }

  update_checkbox_andereRechnungsadresse(checked: boolean){
    this.form.get('andereRechnungsadresse')?.patchValue(checked ? 'true' : 'false')
  }
  //#endregion
  //#region Umleitung
  zurueck(){
    this.location.back();
  }
  //#endregion
}
