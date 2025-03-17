import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-checkout-erfolgreich-dialog',
  templateUrl: './checkout-erfolgreich-dialog.component.html',
  styleUrl: './checkout-erfolgreich-dialog.component.scss'
})
export class CheckoutErfolgreichDialogComponent {
  aunr!: string|number

  constructor(
    public dialogRef: MatDialogRef<CheckoutErfolgreichDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router
  ) {
    this.aunr = data.aunr
  }
  
  ngOnInit(){
    
  }


  //#region Umleitung
  umleiten_nach_bestellungen(){
    this.dialogRef.close(true);
    this.router.navigate(UtilUrl.bestellungen.bestellungen)
  }
  //#endregion
}
