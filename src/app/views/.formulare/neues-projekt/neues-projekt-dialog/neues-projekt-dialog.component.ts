import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BackendService } from 'src/app/services/backend.service';

import { UtilBaugruppe } from 'src/app/utils/util.baugruppe';
import { UtilUrl } from 'src/app/utils/util.url';
import { UtilValidator } from 'src/app/utils/util.validator';
import { BauteilOptionStatus } from 'src/app/enum/bauteilOptionenStatus';

@Component({
  selector: 'mpl-neues-projekt-dialog',
  templateUrl: './neues-projekt-dialog.component.html',
  styleUrl: './neues-projekt-dialog.component.scss'
})
export class NeuesProjektDialogComponent {
  weiter_clicked_schritt_1: boolean = false;
  weiter_clicked_schritt_2: boolean = false;

  warten_pruefeBgnrkd: boolean = false;

  bauteilOptionStatus = BauteilOptionStatus;

  form_neues_projekt: FormGroup = this._formBuilder.group({
    baugruppenname: [
      '', 
      [ 
        Validators.required
      ]
    ],
    baugruppenmenge: [
      '', 
      [ 
        Validators.required,
        Validators.min(1),
        UtilValidator.positiveNumberValidator
      ]
    ]
  })
  radiobutton_bauteilOptionStatus: BauteilOptionStatus = BauteilOptionStatus.LIEFERZEIT

  fehlermeldung_baugruppenname: any = {
    "required": "Bitte tragen Sie einen Baugruppen Namen ein!"
    , "bgnrkd_existiert": "Der Name existiert bereits, wählen Sie einen anderen Namen!"
  }

  naechster_schritt: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<NeuesProjektDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
    private backend: BackendService, 
    private router: Router,
    private _formBuilder: FormBuilder
  ) {}

  zurueck_zum_vorherigen_schritt(){
    this.weiter_clicked_schritt_1 = false;
    this.weiter_clicked_schritt_2 = false;
    this.naechster_schritt = false
  }

  abbrechen(): void {
    this.router.navigate(UtilUrl.home)

    this.dialogRef.close(false);
  }

  weiter_zum_naechsten_schritt() {
    this.weiter_clicked_schritt_1 = true;

    this.pruefe_form().then((value)=>{
      if(value === true){
        this.naechster_schritt = true
      }else if(value === false){
        this.form_neues_projekt.get("baugruppenname")?.setErrors({ "bgnrkd_existiert": true });
      }
    })
  }

  weiter():void {
    this.pruefe_form().then((value)=>{
      if(value === true){
        let baugruppenname = this.form_neues_projekt.get("baugruppenname")?.value;
        let baugruppenmenge = this.form_neues_projekt.get("baugruppenmenge")?.value;

        localStorage.setItem("baugruppenname", baugruppenname)
        localStorage.setItem("baugruppenmenge", baugruppenmenge)
        localStorage.setItem("bauteiloptionkd", this.radiobutton_bauteilOptionStatus.toString())
        
        this.router.navigate(UtilUrl.neuesProjekt.import)

        this.dialogRef.close(true);
      }else if(value === false){
        this.form_neues_projekt.get("baugruppenname")?.setErrors({ "bgnrkd_existiert": true });
      }
    })
  }

  pruefe_form():Promise<boolean | null> { 
    return new Promise((resolve, reject)=>{
      if(this.form_neues_projekt.invalid){
        resolve(null)
      }

      let baugruppenname = this.form_neues_projekt.get("baugruppenname")?.value;

      this.warten_pruefeBgnrkd = true
      UtilBaugruppe.pruefeBgnrkd(this.backend, baugruppenname).then((value: boolean) => {
        
        this.warten_pruefeBgnrkd = false
        if(value){
          resolve(false)
        }else{
          resolve(true)
        }
      });
    })
  }
}
