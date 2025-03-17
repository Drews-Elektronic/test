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
import { UtilBauteileFiltern } from 'src/app/utils/util.bauteile-filtern';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/views/.children/dialog/dialog.component';
import { filter, take } from 'rxjs';
import { keyframes } from '@angular/animations';
import { UtilDialog } from 'src/app/utils/util.dialog';
import { UtilFormular } from 'src/app/utils/util.formular';

@Component({
  selector: 'mpl-auftraege-stueckliste',
  templateUrl: './auftraege-stueckliste.component.html',
  styleUrls: ['./auftraege-stueckliste.component.scss'],
  animations: getTrigger
})
export class AuftraegeStuecklisteComponent {
  bgnr: any
  aunr: any

  bgnrkd: string | undefined;
  bestellt: boolean | undefined;

  filterAll: string = ""

  menge: number = 0

  erstes_coloum: Array<string>  = ["select", "soll", "bompos", "btnrkd", "btbeschreibungkd",     "htnrkd",     "lieferZeit",     "gesamtpreis",     "anzprobgkomp", "verfuegbar",     "technDaten",             "slbemerkungkd", "loeschen"];
  zweites_coloum: Array<string> = ["leer",   "ist",  "leer",   "leer",   "ist-btbeschreibungkd", "ist-htnrkd", "ist-lieferZeit", "ist-gesamtpreis", "leer",         "ist-verfuegbar", "technDaten-ohne-header", "leer",          "leer"];
  erstes_coloum_with_expand = [...this.erstes_coloum, 'expand'];
  zweitescolumn_with_expand = [...this.zweites_coloum, 'expand'];

  angebot_bom_daten: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  selected_linamekd: string | undefined = undefined;

  formFields: any

  bereit: boolean = false;
  bereit_alle_verfuegbarkeiten: boolean = true;
  bereit_eine_verfuegbarkeit: boolean = true;

  // Für den Ladebalken
  fertig_gepruefte_bt: number = 0;
  prozent_fertig_gepruefte_bt: number = 100;

  // Enums
  QuellenStatus = QuellenStatus
  Beistellung = Beistellung

  top_teuersten_bauteile: any
  top_laengste_lieferzeit: any

  constructor(
    private backend: BackendService,
    private mitteilungService: MitteilungService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    
  }

  ngOnInit(): void {
    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
    this.aunr = this.activatedRoute.snapshot.paramMap.get('aunr');

    let promise_array: Promise<any>[] = []
    if (this.aunr) {
      promise_array.push(this.GetEinenAuftrag())
      promise_array.push(this.GetAuftragStueckliste())
    }

    promise_array.push(this.GetFormFields())

    Promise.all(promise_array).finally(() => {
      this.bereit = true
    })
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region GET
  GetEinenAuftrag() {
    return new Promise((resolve, reject) => {
      let subscription = this.backend.GetAuftraege(this.aunr).subscribe((value: any) => {
        subscription.unsubscribe();

        if (value !== false) {
          this.bgnrkd = value[0].bgnrkd
          this.bestellt = value[0].bestellt
          this.menge = value[0].auftragsmenge
        }

        resolve(value)
      }, (error) => {
        console.error(error)
        reject(error)
      });
    })
  }

  GetAuftragStueckliste() {
    this.bereit = false;

    return new Promise((resolve, reject) => {
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

            this.angebot_bom_daten = new MatTableDataSource(value);
            this.angebot_bom_daten.data.length = value?.length;

            this.angebot_bom_daten.paginator = this.paginator;

            this.BauteileFiltern()
          }
          resolve(value)
        }, (error) => {
          console.error(error)
          reject(error)
        });
    })
  }

  GetFormFields() {
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.GetFormFields("MPLBauteilPoolZeile").subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.formFields = value
        }

        resolve(value)
      }, (error)=>{
        console.error(error)
        reject(error)
      });
    })
  }
  //#endregion
  //#region Update, Delete
  loescheStueckliste(
    element: any
  ) {
    let length: number
    let stueckliste_name: string
    if(element?.selected && Array.isArray(element?.selected)){
      length = element.selected.length
      stueckliste_name = element.selected[0].btnrkd
    }else{
      length = 1
      stueckliste_name = element?.btnrkd
    }

    let titel: string;
    let content: string;
    if(length > 1){
      titel = length + " Bauteile Löschen";
      content = "Wollen Sie wirklich " + length + " Bauteile unwiderruflich löschen?"
    }else{
      titel = "Bauteil '" + stueckliste_name + "' Löschen";
      content = "Wollen Sie wirklich das Bauteil unwiderruflich löschen?"
    }

    UtilDialog.loeschenBestaetigen(
      this.dialog
      ,titel
      ,content
    ).then(()=>{
      if(element?.selected && Array.isArray(element?.selected)){
        UtilFormular.loopAngularMaterialTableSelection(
          element
          , (value1: any, resolve: any, reject: any)=>{
              let subscription2 = this.backend
                .DeleteAuftragStuecklistenzeile(value1.ID)
                .subscribe((value2) => {
                  subscription2.unsubscribe();
                  if (value2 !== false) {
                    UtilFormular.loescheZeileDurchID(this.angebot_bom_daten, 'ID', value1.ID);
                  }
                  resolve(true)
                },(error)=>{
                  console.error(error)
                  reject(error)
                });
          }
        ).finally(()=>{
          element.clear()
        })
      }else{
        let subscription2 = this.backend
          .DeleteAuftragStuecklistenzeile(element.ID)
          .subscribe((value) => {
            subscription2.unsubscribe();
            
            if(value !== false){
              UtilFormular.loescheZeileDurchID(this.angebot_bom_daten, 'ID', element.ID);
            }
          });
      }
    })
  }
  //#endregion
  //#region filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.angebot_bom_daten.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
  //#region Alternativ
  alternative_suche(bauteil: any) {
    if(this.menge){
      localStorage.setItem("bauteil", JSON.stringify(bauteil))
      this.navigateZumAlternativenBauteilSuchen(bauteil.ID)
    }
  }

  alternatives_loeschen(element:any){
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        titel: "Alternative Bauteil löschen",
        content: "Wollen Sie wirklich das alternative Bauteil löschen?",
        ja_button_content: "löschen",
        ja_button_style: "success",
        nein_button_exist_not: true
      }
    });

    dialogRef.afterClosed()
      .pipe(
        take(1),
        filter((result: any) => result != undefined),   // Abbrechen
      )
      .subscribe((result: any) => { 
        element.spinning = true;
        let subscription = this.backend
          .AusgewaehltesAlternativesAngebotLoeschen(element)
          .subscribe((value) => {
            subscription.unsubscribe();
            
            element.spinning = false;

            if (value !== false) {
              this.eine_verfuegbarkeit_pruefen(element);
            }
          });
      });
  }
  //#endregion
  //#region Beistellung und nicht bestücken
  Bauteil_als_beschaffen_umstellen(stuecklisten_zeile: any) {
    if (stuecklisten_zeile) {
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '500px',
        data: {
          titel: "Bauteil soll von uns beschafft werden.",
          ja_button_content: "beschaffen",
          ja_button_style: "success",
          nein_button_exist_not: true
        }
      });

      dialogRef.afterClosed()
        .pipe(
          take(1),
          filter((result: any) => result != undefined) // abbrechen: undefined
        )
        .subscribe((result: any) => { // ja: true; nein: false;
          if (result) {
            stuecklisten_zeile.spinning = true

            let subscription = this.backend
              .UpdateAuftragStuecklistezeile(this.aunr, stuecklisten_zeile.ID, Beistellung.BESCHAFFUNG)
              .subscribe((value) => {
                subscription.unsubscribe();

                if (value !== false) {
                  stuecklisten_zeile.agbskd = Beistellung.BESCHAFFUNG;
                  this.eine_verfuegbarkeit_pruefen(stuecklisten_zeile)
                }
              });
          }
        });
    }
  }

  Bauteil_als_beigestellt_umstellen(stuecklisten_zeile: any) {
    if (stuecklisten_zeile) {
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '500px',
        data: {
          titel: "Bauteil soll von ihnen beigestellt werden.",
          ja_button_content: "beistellen",
          ja_button_style: "success",
          nein_button_exist_not: true
        }
      });

      dialogRef.afterClosed()
        .pipe(
          take(1),
          filter((result: any) => result != undefined) // abbrechen: undefined
        )
        .subscribe((result: any) => { // ja: true; nein: false;
          if (result) {
            stuecklisten_zeile.spinning = true
            
            let subscription = this.backend
              .UpdateAuftragStuecklistezeile(this.aunr, stuecklisten_zeile.ID, Beistellung.BEISTELLUNG)
              .subscribe((value) => {
                subscription.unsubscribe();

                if (value !== false) {
                  stuecklisten_zeile.agbskd = Beistellung.BEISTELLUNG;
                }

                stuecklisten_zeile.spinning = false
              });
          }
        });
    }
  }

  Bauteil_als_nicht_bestuecken_umstellen(stuecklisten_zeile: any) {
    if (stuecklisten_zeile) {
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '500px',
        data: {
          titel: "Bauteil soll nicht bestückt werden.",
          ja_button_content: "nicht bestücken",
          ja_button_style: "success",
          nein_button_exist_not: true
        }
      });

      dialogRef.afterClosed()
        .pipe(
          take(1),
          filter((result: any) => result != undefined) // abbrechen: undefined
        )
        .subscribe((result: any) => { // ja: true; nein: false;
          if (result) {
            stuecklisten_zeile.spinning = true

            let subscription = this.backend
              .UpdateAuftragStuecklistezeile(this.aunr, stuecklisten_zeile.ID, Beistellung.NICHT_BESTUECKEN)
              .subscribe((value) => {
                subscription.unsubscribe();

                if (value !== false) {
                  stuecklisten_zeile.agbskd = Beistellung.NICHT_BESTUECKEN;
                }

                stuecklisten_zeile.spinning = false
              });
          }
        });
    }
  }
  //#endregion
  //#region Quellenaktualisieren (veraltet) (PHP Funktionen sind ebenfalls veraltet)
  async alle_verfuegbarkeiten_pruefen() {
    if (this.angebot_bom_daten.data.length > 0) {
      this.bereit_alle_verfuegbarkeiten = false

      // Den Ladebalken zurücksetzen
      this.fertig_gepruefte_bt = 0;
      this.prozent_fertig_gepruefte_bt = 0;

      // Auf die erste Seite umschlagen
      this.angebot_bom_daten.paginator?.firstPage()

      let subscription = this.backend.verfuegbarkeitZuruecksetzen("aunr", this.aunr).subscribe(async (value) => {
        subscription.unsubscribe();

        // Verfügbarkeit in der dataSource auf 0 setzen
        this.angebot_bom_daten.data.forEach((element: any) => {
          
          element.maxlbverfuegbar = QuellenStatus.NICHT_GEPRUEFT;
        });
        this.angebot_bom_daten._updateChangeSubscription();

        // prüft die Verfügbarkeit von 10 Bauteilen
        let anzahl_der_pruefenden_bauteile = 10

        // Variablen deklarieren
        let index0 = 0;
        let anzahl_der_Seiten = Math.ceil(this.angebot_bom_daten.data.length / this.paginator.pageSize);
        let promise_array = []

        // prüft die Verfügbarkeit Seitenweise
        for (let index1 = 0; index1 < anzahl_der_Seiten; index1++) { // Gehe durch alle Seiten
          for (let index2 = 0; index2 < this.paginator.pageSize; index2++) { // Gehe durch die Seite, aber jeweils nur 10 Bauteile
            let komp_stuecklisten_zeile = this.angebot_bom_daten.data[index0]
            if (komp_stuecklisten_zeile != undefined
              && komp_stuecklisten_zeile['agbskd'] != undefined) {
              if (komp_stuecklisten_zeile['agbskd'] == Beistellung.BESCHAFFUNG) {
                promise_array.push(this.verfuegbarkeit_pruefen(komp_stuecklisten_zeile, true, false));
              } else {
                this.add_fertig_gepruefte_bt();
              }
            }

            if (promise_array.length === anzahl_der_pruefenden_bauteile) {
              // Die Async Bauteile prüfen
              await Promise.all(promise_array)
              promise_array = [];
            }

            index0++;
          }

          // Auf die nächste Seite umschlagen
          this.angebot_bom_daten.paginator?.nextPage()
        }

        this.bereit_alle_verfuegbarkeiten = true
      });


    }
  }

  async eine_verfuegbarkeit_pruefen(element: any, ladebalken_verwenden: boolean = false, message: boolean = true,) {
    this.bereit_eine_verfuegbarkeit = false;

    return this.verfuegbarkeit_pruefen(element, ladebalken_verwenden, message)
  }

  async verfuegbarkeit_pruefen(element: any, ladebalken_verwenden: boolean = false, message: boolean = true) {
    await new Promise((resolve, reject) => {
      element.spinning = true;

      let subscription1 = this.backend
        // .QuellenAktualisierenNew("AUSLNR", 1, this.aunr, 0, element.btnrkd, element.id, element.auftragsmenge, message)
        .QuellenAktualisierenNew("AUSLNR", element.ID, element.auftragsmenge, 1, element.btnrkd, message)
        .subscribe((value: any) => {
          subscription1.unsubscribe();

          let subscription2 = this.backend
            .GetAuftragStueckliste(0, element.ID)
            .subscribe((value: any) => {
              subscription2.unsubscribe();

              element.spinning = false;

              if (value.length == 1) {
                let value_mit_spinning = value[0]
                value_mit_spinning.spinning = false;

                // Zeile in die Tabelle Laden
                let index = this.angebot_bom_daten.data.findIndex((value: any) => value.ID === element.ID)
                this.angebot_bom_daten.data[index] = value_mit_spinning;
                this.angebot_bom_daten._updateChangeSubscription();
              }

              // Den Ladebalken erhöhen
              if (ladebalken_verwenden) {
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
  zurueck() {
    this.router.navigate(UtilUrl.angebote.leiterplatte(this.bgnr, this.aunr))
  }

  weiter() {
    this.router.navigate(UtilUrl.angebote.vergleichen(this.bgnr, this.aunr))
  }

  navigateZumAlternativenBauteilSuchen(id: any){
    this.router.navigate(UtilUrl.angebote.alternativ(this.bgnr, this.aunr, id))
  }
  //#endregion
  //#region sonstiges
  add_fertig_gepruefte_bt() { // Für den Ladebalken
    this.fertig_gepruefte_bt++;

    if (this.angebot_bom_daten.data.length > 0) {
      this.prozent_fertig_gepruefte_bt = this.fertig_gepruefte_bt / this.angebot_bom_daten.data.length * 100;
    }
  }

  private BauteileFiltern() {
    const verfuegbar = UtilBauteileFiltern.verfuegbare_bauteile(this.angebot_bom_daten.data)

    let top_teuersten_bauteile: any[] = [];
    let top_laengste_lieferzeit: any[] = [];
    if (verfuegbar && verfuegbar.length > 0) {
      top_teuersten_bauteile = UtilBauteileFiltern.top_5_bauteile_teuersten_bauteile(verfuegbar)
      top_laengste_lieferzeit = UtilBauteileFiltern.top_5_bauteile_laengsten_lieferzeiten(verfuegbar);
    }
    this.top_teuersten_bauteile = top_teuersten_bauteile;
    this.top_laengste_lieferzeit = top_laengste_lieferzeit;
  }
  //#endregion

}
