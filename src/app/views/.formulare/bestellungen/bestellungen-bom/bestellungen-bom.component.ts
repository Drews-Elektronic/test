import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { Beistellung } from 'src/app/enum/beistellung';
import { QuellenStatus } from 'src/app/enum/quellen-status';
import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { getTrigger } from 'src/app/services/table.service';
import { UtilBauteileFiltern } from 'src/app/utils/util.bauteile-filtern';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-bestellungen-bom',
  templateUrl: './bestellungen-bom.component.html',
  styleUrl: './bestellungen-bom.component.scss',
  animations: getTrigger
})
export class BestellungenBomComponent {
  bestellungID: any
  aunr: any
  bgnr: any

  filterAll: string = ""

  komprimiert: boolean = true;

  erstes_coloum: Array<string> = ["soll", "bompos", "btnrkd", "btbeschreibungkd", "htnrkd", "lieferZeit", "gesamtpreis", "anzprobgkomp", "verfuegbar", "technDaten", "slbemerkungkd"];
  zweites_coloum: Array<string> = ["ist", "leer", "leer", "ist-btbeschreibungkd", "ist-htnrkd", "ist-lieferZeit", "ist-gesamtpreis", "leer", "ist-verfuegbar", "technDaten-ohne-header", "leer"];
  erstes_coloum_with_expand = [...this.erstes_coloum, 'expand'];
  zweitescolumn_with_expand = [...this.zweites_coloum, 'expand'];

  angebot_bom_daten: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator | any;

  expandedElement: any | null | undefined;

  selected_linamekd: string | undefined = undefined;

  bauteile: any[] = [];

  formFields: any

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

  top_teuersten_bauteile: any
  top_laengste_lieferzeit: any

  constructor(
    private backend: BackendService,
    private mitteilungService: MitteilungService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    
  }

  ngOnInit(): void {
    this.bestellungID = this.activatedRoute.snapshot.paramMap.get('bestellungID');
    Promise.all([
      this.BestellungAnzeigen()
      , this.GetFormFields()
    ]).finally(() => {
      this.bereit = true
    })
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region GET
  BestellungAnzeigen() {
    return new Promise((resolve, reject) => {
      let subscription = this.backend
        .BestellungAnzeigen(this.bestellungID)
        .subscribe((value: any) => {
          subscription.unsubscribe();

          if (value !== false) {
            this.aunr = value[0].aunr;
            this.GetAuftragStueckliste()
          }

          resolve(value);
        }, (error: any) => {
          console.error(error)
          reject(error);
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

  //#endregion
  //#region filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.angebot_bom_daten.filter = filterValue.trim().toLowerCase();
  }
  //#endregion
  //#region Umleitung
  zurueck() {
    this.router.navigate(UtilUrl.bestellungen.bestellungen)
  }
  //#endregion
  //#region sonstiges
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
