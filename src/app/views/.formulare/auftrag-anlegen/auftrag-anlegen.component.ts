import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { AuftragAnlegenDialogComponent } from './auftrag-anlegen-dialog/auftrag-anlegen-dialog.component';

import { BackendService } from 'src/app/services/backend.service';

import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-auftrag-anlegen',
  templateUrl: './auftrag-anlegen.component.html',
  styleUrl: './auftrag-anlegen.component.scss'
})
export class AuftragAnlegenComponent {
  baugruppe_neuer_auftrag: boolean = false;
  auftrag_fortfahren: boolean = false;

  bereit: boolean = false;

  bgnr: any;
  aunr: any;
  bgnrkd: string = "";

  baugruppen: any[] = [];
  auftrag: any;

  constructor(
    private backend: BackendService, 
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private mitteilungService: MitteilungService
  ) {}

  ngOnInit(){
    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
    this.aunr = this.activatedRoute.snapshot.paramMap.get('aunr');
    
    Promise.all([
      this.getBaugruppen(),
      this.aunr ? this.GetAuftraege(this.aunr): null
    ]).then((value) => {
      this.bereit = true;

      const dialogRef = this.dialog.open(AuftragAnlegenDialogComponent, {
        data: { 
          bgnr: this.bgnr,
          aunr: this.aunr,
          baugruppen: this.baugruppen,
          auftrag: this.auftrag
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
    if(this.router.url.includes(UtilUrl.angebotFortfahren.angebote[0])){
      this.auftrag_fortfahren = true;
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

  GetAuftraege(aunr:number|string) {
    this.bereit = false;

    return new Promise((resolve, reject) => {
      let subscription = this.backend.GetAuftraege(aunr).subscribe((value) => {
        subscription.unsubscribe();

        if(value != false){
          this.auftrag = value[0];
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
