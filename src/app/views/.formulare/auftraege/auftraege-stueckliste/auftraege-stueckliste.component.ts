import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';
import { getTrigger } from 'src/app/services/table.service'

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { QuellenStatus } from 'src/app/enum/quellen-status';
import { Beistellung } from 'src/app/enum/beistellung';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-auftraege-stueckliste',
  templateUrl: './auftraege-stueckliste.component.html',
  styleUrls: ['./auftraege-stueckliste.component.scss'],
  animations: getTrigger
})
export class AuftraegeStuecklisteComponent {
  auftrag_fortfahren: boolean = false;

  aunr_display: string = "Es wird geladen.";

  bgnr: any
  aunr: any
  bestellungID: any

  bgnrkd: string | undefined;
  bestellt: boolean | undefined;

  aunrkd: string = "";

  filterAll: string = ""

  komprimiert: boolean = true;
  anzeigen: string = "sl";

  Colums: Array<string> = ["bompos", "btnrkd", "btbeschreibungkd", "htnrkd", "anzprobgkomp", "technDaten", "verfuegbar", "agbskd"];
  columnsWithExpand = [...this.Colums, 'expand'];

  Stueckliste: MatTableDataSource<any> = new MatTableDataSource();
  StuecklisteLength: number = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  expandedElement: any | null | undefined;

  selected_linamekd: string | undefined = undefined;

  bauteile: any[] = [];

  aglakd: any[] = []
  aghakd: any[] = []
  agbskd: any[] = []
  agbtkd: any[] = []

  linamekd: any[] = []

  bereit: boolean = false;
  bereit_alle_verfuegbarkeiten: boolean = true;
  bereit_eine_verfuegbarkeit: boolean = true;

  // Für den Ladebalken
  fertig_gepruefte_bt: number = 0;
  prozent_fertig_gepruefte_bt: number = 100;

  // Enums
  QuellenStatus = QuellenStatus
  Beistellung = Beistellung

  constructor(
    private backend: BackendService,
    private mitteilungService: MitteilungService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    if(this.router.url.includes(UtilUrl.angebotFortfahren.angebote[0])){
      this.auftrag_fortfahren = true;
    }
  }

  ngOnInit(): void {
    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
    this.aunr = this.activatedRoute.snapshot.paramMap.get('aunr');
    this.bestellungID = this.activatedRoute.snapshot.paramMap.get('bestellungID');
    
    if (this.bestellungID) {
      this.BestellungAnzeigen().then(()=>{
        this.bereit = true
      })
    }else if (this.auftrag_fortfahren) {
      Promise.all([
        this.GetEinenAuftrag(),
        this.GetAuftragStueckliste()
      ]).then((value)=>{
        this.bereit = true
      })
    }else if (this.aunr) {
      Promise.all([
        this.GetEinenAuftrag(),
        this.GetAuftragStueckliste()
      ]).then((value)=>{
        this.bereit = true
      })
    }

    this.GetBauteile();

    this.GetFormFields();
    this.GetLieferanten();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region GET
  GetEinenAuftrag(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.GetAuftraege(this.aunr).subscribe((value: any) => {
        subscription.unsubscribe();

        if (value !== false) {
          this.bgnrkd = value[0].bgnrkd
          this.bestellt = value[0].bestellt
        }

        resolve(value)
      },(error)=>{
        console.error(error)
        reject(error)
      });
    })
  }

  GetAuftragStueckliste() {
    this.bereit = false;

    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .GetAuftragStueckliste(this.aunr)
        .subscribe((value: any) => {
          subscription.unsubscribe();
          if (value !== false) {
            value.sort((a: any, b: any) => a.bompos - b.bompos);

            // Füge Spinning in die Objekte ein
            let value_mit_spinning: any = value;
            value_mit_spinning.forEach((element: any) => {
              element.spinning = false;
            });

            this.bgnr = value[0].bgnr;

            this.Stueckliste = new MatTableDataSource(value);;
            this.StuecklisteLength = value?.length;

            this.aunr_display = "Auftrag: " + this.aunr

            this.Stueckliste.paginator = this.paginator;
          }
          resolve(value)
        },(error)=>{
          console.error(error)
          reject(error)
        });
    })
  }

  GetBauteile() {
    let subscription = this.backend
      .GetBauteile()
      .subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          if (Array.isArray(value)) {
            let tmp_value: any[] = []
            value.forEach(element => {
              tmp_value.push({
                value: element.btnr,
                name: element.btnrkd
              });
            });
            this.bauteile = tmp_value;
          }
        }
      });
  }

  GetLieferanten() {
    let subscription = this.backend.GetLieferant().subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.linamekd = value;
      }
    });
  }

  GetFormFields() {
    let subscription = this.backend.GetFormFields("MPLBauteilPoolZeile").subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.agbskd = value.agbs
        this.agbtkd = value.agbt
        this.aghakd = value.agha
        this.aglakd = value.agla
      }
    });
  }

  BestellungAnzeigen(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .BestellungAnzeigen(this.bestellungID)
        .subscribe((value: any) => {
          subscription.unsubscribe();
          
          if (value !== false) {
            this.aunr = value[0].aunr;
            this.GetAuftragStueckliste()
          }

          resolve(value);
        }, (error: any)=>{
          console.error(error)
          reject(error);
        });
    })
  }
  //#endregion
  //#region Update, Delete
  
  //#endregion
  //#region filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.Stueckliste.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
  //#region Quellenaktualisieren
  async alle_verfuegbarkeiten_pruefen() {
    if (this.StuecklisteLength > 0) {
      this.bereit_alle_verfuegbarkeiten = false

      // Den Ladebalken zurücksetzen
      this.fertig_gepruefte_bt = 0;
      this.prozent_fertig_gepruefte_bt = 0;

      // Auf die erste Seite umschlagen
      this.Stueckliste.paginator?.firstPage()

      let subscription = this.backend.verfuegbarkeitZuruecksetzen("aunr", this.aunr).subscribe(async (value) => {
        subscription.unsubscribe();

        // Verfügbarkeit in der dataSource auf 0 setzen
        this.Stueckliste.data.forEach((element: any) => {
          element.maxlbverfuegbar = QuellenStatus.NICHT_GEPRUEFT;
        });
        this.Stueckliste._updateChangeSubscription();

        // prüft die Verfügbarkeit von 10 Bauteilen
        let anzahl_der_pruefenden_bauteile = 10 

        // Variablen deklarieren
        let index0 = 0;
        let anzahl_der_Seiten = Math.ceil(this.StuecklisteLength / this.paginator.pageSize);
        let promise_array = []

        // prüft die Verfügbarkeit Seitenweise
        for (let index1 = 0; index1 < anzahl_der_Seiten; index1++) { // Gehe durch alle Seiten
          for (let index2 = 0; index2 < this.paginator.pageSize; index2++) { // Gehe durch die Seite, aber jeweils nur 10 Bauteile
            let komp_stuecklisten_zeile = this.Stueckliste.data[index0]
            if(komp_stuecklisten_zeile != undefined
            && komp_stuecklisten_zeile['agbskd'] != undefined){
              if(komp_stuecklisten_zeile['agbskd'] == Beistellung.BESCHAFFUNG){
                promise_array.push(this.verfuegbarkeit_pruefen(komp_stuecklisten_zeile, true, false));
              }else{
                this.add_fertig_gepruefte_bt();
              }
            }

            if( promise_array.length === anzahl_der_pruefenden_bauteile ){
              // Die Async Bauteile prüfen
              await Promise.all(promise_array)
              promise_array = [];
            }

            index0++;
          }
            
          // Auf die nächste Seite umschlagen
          this.Stueckliste.paginator?.nextPage()
        }
        
        this.bereit_alle_verfuegbarkeiten = true
      });

      
    }
  }

  async eine_verfuegbarkeit_pruefen(element: any, ladebalken_verwenden:boolean = false, message: boolean = true, ) {
    this.bereit_eine_verfuegbarkeit = false;

    return this.verfuegbarkeit_pruefen(element, ladebalken_verwenden, message)
  }

  async verfuegbarkeit_pruefen(element: any, ladebalken_verwenden:boolean = false, message: boolean = true) {
    await new Promise((resolve, reject) => {
      element.spinning = true; 

      let subscription1 = this.backend
        // .QuellenAktualisieren("AUSLNR", 1, 0, 0, this.aunr, element.bgnr, 0, element.id, element.btnrkd)
        .QuellenAktualisierenNew("AUSLNR", 1, this.aunr, 0, element.btnrkd, element.id, element.auftragsmenge, message)
        .subscribe((value: any) => {
          subscription1.unsubscribe();

          let subscription2 = this.backend
            .GetAuftragStueckliste(0, element.id)
            .subscribe((value: any) => {
              subscription2.unsubscribe();

              element.spinning = false;

              if(value.length == 1){
                let value_mit_spinning = value[0]
                value_mit_spinning.spinning = false;

                // Zeile in die Tabelle Laden
                let index = this.Stueckliste.data.findIndex((value:any)=> value.id === element.id)
                this.Stueckliste.data[index] = value_mit_spinning;
                this.Stueckliste._updateChangeSubscription();
              }

              // Den Ladebalken erhöhen
              if(ladebalken_verwenden){
                this.add_fertig_gepruefte_bt();
              }

              this.bereit_eine_verfuegbarkeit = true;

              resolve(true)
            });
        });
    })
  }
  //#endregion
  //#region Umleitung
  zurueck(){
    if(this.auftrag_fortfahren){
      this.router.navigate(UtilUrl.angebotFortfahren.leiterplatte(this.bgnr, this.aunr))
    }else if(this.bestellungID){
      this.router.navigate(UtilUrl.bestellungen.bestellungen)
    }else{
      this.router.navigate(UtilUrl.angebote.leiterplatte(this.bgnr, this.aunr))
    }
  }

  weiter(){
    if(this.auftrag_fortfahren){
      this.router.navigate(UtilUrl.angebotFortfahren.vergleichen(this.bgnr, this.aunr))
    }else{
      this.router.navigate(UtilUrl.angebote.vergleichen(this.bgnr, this.aunr))
    }
  }
  //#endregion
  //#region sonstiges
  lieferant_change(event: any, element: any) {
    // finde die ausgewählte Baugruppe durch bgnrkd
    if (!this.linamekd) {
      return
    }
    if (!event?.target || !event?.target.value) {
      return
    }
    let ausgewaehlteLieferant: any = this.linamekd.findIndex(x => x.LINR == event.target.value);

    // ändere die zu verändernden Auftrag mit dem ausgewählten Baugruppe
    element['LINR'] = this.linamekd[ausgewaehlteLieferant]['LINR'];
    element.linamekd = this.linamekd[ausgewaehlteLieferant].Lieferantenname
  }
  // Für den Ladebalken
  add_fertig_gepruefte_bt(){
    this.fertig_gepruefte_bt++;

    if(this.StuecklisteLength > 0){
      this.prozent_fertig_gepruefte_bt = this.fertig_gepruefte_bt / this.StuecklisteLength * 100;
    }
  }
  //#endregion
  
}
