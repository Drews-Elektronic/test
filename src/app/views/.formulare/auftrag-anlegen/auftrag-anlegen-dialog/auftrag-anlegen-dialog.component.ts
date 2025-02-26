import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BauteilOptionStatus } from 'src/app/enum/bauteilOptionenStatus';
import { BackendService } from 'src/app/services/backend.service';
import { UtilUrl } from 'src/app/utils/util.url';
import { UtilValidator } from 'src/app/utils/util.validator';

@Component({
  selector: 'mpl-auftrag-anlegen-dialog',
  templateUrl: './auftrag-anlegen-dialog.component.html',
  styleUrl: './auftrag-anlegen-dialog.component.scss'
})
export class AuftragAnlegenDialogComponent {
  baugruppe_neuer_auftrag: boolean = false;
  auftrag_fortfahren: boolean = false;

  fehlermeldung_baugruppenname: any = {
    "required": "Bitte tragen Sie einen Baugruppen Namen ein!"
    , "bgnrkd_existiert": "Der Name existiert bereits, wählen Sie einen anderen Namen!"
  }

  bereit: boolean = false;

  bgnr: any;
  aunr: any;
  bgnrkd: string = "";

  baugruppen: any[] = [];
  auftrag: any;

  bauteilOptionStatus = BauteilOptionStatus;

  form_neuer_auftrag: FormGroup = this._formBuilder.group({
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
  });

  weiter_clicked: boolean = false;

  naechster_schritt: boolean = false;

  radiobutton_bauteilOptionStatus: BauteilOptionStatus = BauteilOptionStatus.LIEFERZEIT
  
  constructor(
    public dialogRef: MatDialogRef<AuftragAnlegenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
    private backend: BackendService, 
    private router: Router,
    private _formBuilder: FormBuilder
  ) {
    this.form_neuer_auftrag.get('baugruppenname')?.disable();

    const tmp_bgnr = data.bgnr;
    const tmp_aunr = data.aunr;

    const tmp_baugruppen = data.baugruppen;
    const tmp_auftrag = data.auftrag;
    
    this.baugruppen = tmp_baugruppen;
    this.auftrag = tmp_auftrag;

    this.bgnr = tmp_bgnr;
    this.aunr = tmp_aunr;

    if(tmp_baugruppen.length > 0){
      this.baugruppen_daten_uebernehmen(tmp_bgnr)
    }

    if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
      this.baugruppe_neuer_auftrag = true;

      this.radiobutton_bauteilOptionStatus = this.baugruppen[0].bauteiloptionkd
    }
    if(this.router.url.includes(UtilUrl.angebotFortfahren.angebote[0])){
      this.auftrag_fortfahren = true;

      this.radiobutton_bauteilOptionStatus = this.baugruppen[0].bauteiloptionkd
      this.form_neuer_auftrag.get("baugruppenmenge")?.patchValue(tmp_auftrag.auftragsmenge)
    }
  }

  ngOnInit(){
    
  }

  //#region Get
  
  //#endregion
  //#region Formular
  change_select(event: Event){
    const neues_bgnr = (event.target as HTMLSelectElement).value;

    this.baugruppen_daten_uebernehmen(neues_bgnr)
  }

  baugruppen_daten_uebernehmen(tmp_bgnr: any){
    this.bgnr = tmp_bgnr;
    let gefiltert: any = this.baugruppen.find((filter_value)=> filter_value.bgnr == tmp_bgnr)
    this.bgnrkd = gefiltert?.bgnrkd;
    this.form_neuer_auftrag.get("baugruppenname")?.patchValue(gefiltert?.bgnrkd)
  }
  //#endregion
  //#region Abbrechen und Weiter
  abbrechen(): void {
    if(this.baugruppe_neuer_auftrag){
      this.router.navigate(UtilUrl.baugruppen.baugruppen)
    }else if (this.auftrag_fortfahren) {
      this.router.navigate(UtilUrl.angebote.angebote)
    }

    this.dialogRef.close(false);
  }

  weiter_zum_naechsten_schritt() {
    this.weiter_clicked = true;

    this.pruefe_form().then((value)=>{
      if(value){
        this.naechster_schritt = true
      }
    })
  }

  zurueck_zum_vorherigen_schritt(tmp_weiter_clicked: boolean = false) {
    this.weiter_clicked = tmp_weiter_clicked;
    this.naechster_schritt = false;
  }

  weiter(){
    this.weiter_clicked = true

    this.pruefe_form().then(value =>{
      if(value){
        if(this.baugruppe_neuer_auftrag){
          let gefiltert: any = this.baugruppen.find((filter_value)=> filter_value.bgnr == this.bgnr)
          
          let baugruppenmenge = this.form_neuer_auftrag?.get("baugruppenmenge")?.value
          let bauteiloptionkd = this.radiobutton_bauteilOptionStatus
      
          localStorage.setItem("baugruppenmenge", baugruppenmenge);
          
          gefiltert.bauteiloptionkd = bauteiloptionkd
      
          let subscribe = this.backend.UpdateBaugruppe(gefiltert).subscribe((value: any)=>{
            subscribe.unsubscribe()
          })
          
          this.router.navigate(UtilUrl.neuesAngebot.leiterplatte(this.bgnr))
        }else if (this.auftrag_fortfahren) {
          this.auftrag.auftragsmenge = this.form_neuer_auftrag?.get("baugruppenmenge")?.value
    
          let subscribe = this.backend.UpdateAuftraeg(this.auftrag).subscribe((value: any)=>{
            subscribe.unsubscribe()

            this.router.navigate(UtilUrl.angebotFortfahren.leiterplatte(this.bgnr, this.aunr))
          })
        }
    
        this.dialogRef.close(true);
      }else{
        this.zurueck_zum_vorherigen_schritt(true)
      }
    })
  }

  pruefe_form():Promise<boolean> { 
    return new Promise((resolve, reject)=>{
      if(this.form_neuer_auftrag.invalid){
        resolve(false)
      }else{
        resolve(true)
      }
    })
  }
  //#endregion
}
