import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { NeuerAuftragDialogComponent } from './neuer-auftrag-dialog/neuer-auftrag-dialog.component';

import { BackendService } from 'src/app/services/backend.service';

import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-neuer-auftrag-anlegen',
  templateUrl: './neuer-auftrag-anlegen.component.html',
  styleUrl: './neuer-auftrag-anlegen.component.scss'
})
export class NeuerAuftragAnlegenComponent {
  baugruppe_neuer_auftrag: boolean = false;

  bereit: boolean = false;

  bgnr: any;
  bgnrkd: string = "";

  baugruppen: any[] = [];

  constructor(
    private backend: BackendService, 
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private mitteilungService: MitteilungService
  ) {}

  ngOnInit(){
    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
    
    Promise.all([
      this.getBaugruppen()
    ]).then((value) => {
      this.bereit = true;

      const dialogRef = this.dialog.open(NeuerAuftragDialogComponent, {
        data: { 
          bgnr: this.bgnr,
          baugruppen: this.baugruppen
        },
        disableClose: true
      });

      let subscribe1 = dialogRef.afterClosed().pipe(
        take(1),
        filter((result: any) => result != undefined),   // Abbrechen
        tap((result: any) => {                          // ja: true; nein: false;
          subscribe1.unsubscribe();
        })
      ).subscribe();
    });

    if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
      this.baugruppe_neuer_auftrag = true;
    }
  }
  
  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region Get
  getBaugruppen(){
    return new Promise((resolve, reject) => {
      let subscription = this.backend.GetBaugruppen().subscribe((value: any) => {
        subscription.unsubscribe();

        if(value != false){
          this.baugruppen = value;

          let gefiltert: any = value.find((filter_value: any)=> filter_value.bgnr == this.bgnr)
          this.bgnrkd = gefiltert?.bgnrkd;
        }

        resolve(true);
      }, (error) => {
        console.error(error)
        reject(error);
      });
    });
  }
  //#endregion
}
