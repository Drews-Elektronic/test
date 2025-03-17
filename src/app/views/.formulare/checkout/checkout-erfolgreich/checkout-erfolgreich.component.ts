import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';
import { CheckoutErfolgreichDialogComponent } from './checkout-erfolgreich-dialog/checkout-erfolgreich-dialog.component';

@Component({
  selector: 'mpl-checkout-erfolgreich',
  templateUrl: './checkout-erfolgreich.component.html',
  styleUrl: './checkout-erfolgreich.component.scss'
})
export class CheckoutErfolgreichComponent {
  bitte_warten: boolean = true;

  aunr!: any;
  bgnr!: any;

  checkoutSessionId!: any;

  constructor(
    private backend: BackendService,
    private activatedRoute: ActivatedRoute,
    private mitteilungService: MitteilungService,
    private dialog: MatDialog
  ) {
    let aunr = this.activatedRoute.snapshot.paramMap.get('aunr');
    let bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
    let checkoutSessionId = this.activatedRoute.snapshot.queryParamMap.get('session_id');

    if(aunr && bgnr && checkoutSessionId){
      this.aunr = aunr
      this.bgnr = bgnr
      this.checkoutSessionId = checkoutSessionId
    }else{
      this.mitteilungService.createMessageDialog("Ein Unerwarteter Fehler ist aufgetreten! Melden Sie es dem IT-Support")
    }
  }

  ngOnInit(){
    if(this.aunr && this.bgnr && this.checkoutSessionId){
      this.auftragBestaetigen().then((value1)=>{
        if(value1 !== false){
          this.BestellungAnlegen().then((value2: any)=>{
            if(value2 !== false){
              this.CheckPayment(value2).then((value3)=>{
                this.bitte_warten = false

                this.DialogAufrufen()
              })
            }
          })
        }else{
          this.bitte_warten = false

          this.DialogAufrufen()
        }
      });
    }
  }

  ngOnDestroy(){
    this.mitteilungService.closeMessage();
  }

  //#region Popup/Dialog
  DialogAufrufen(){
    const dialogRef = this.dialog.open(CheckoutErfolgreichDialogComponent, {
      disableClose: true,
      data:{
        aunr: this.aunr
        , bgnr: this.bgnr
        , checkoutSessionId: this.checkoutSessionId
      }
    });
    
    let subscribe1 = dialogRef.afterClosed().pipe(
      take(1),
      filter((result: any) => result != undefined),   // Abbrechen
      tap((result: any) => {                          // ja: true; nein: false;
        subscribe1.unsubscribe();
      })
    ).subscribe();
  }
  //#endregion
  //#region Auftrag
  auftragBestaetigen(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.AuftragBestaetigen(this.aunr).subscribe((value) => {
        subscription.unsubscribe();
    
        if (value !== false) {
          
        }

        resolve(value)
      }, (error)=>{
        console.error(error)
        resolve(false)
      });
    });
  }
  //#endregion
  //#region Bestellung
  BestellungAnlegen(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.BestellungAnlegen(this.aunr).subscribe((value) => {
        subscription.unsubscribe();
    
        if (value !== false) {
          
        }

        resolve(value)
      }, (error)=>{
        console.error(error)
        resolve(false)
      });
    })
  }
  
  CheckPayment(bestellID: any){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.CheckPayment(bestellID, this.checkoutSessionId).subscribe((value) => {
        subscription.unsubscribe();
    
        if (value !== false) {
          
        }

        resolve(value)
      });
    });
  }
  //#endregion
}
