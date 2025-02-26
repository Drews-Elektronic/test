import { Component } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';

import { MatTableDataSource } from '@angular/material/table';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { UtilAngebotLoeschen } from 'src/app/utils/util.angebot-loeschen';

import { QuellenStatus } from 'src/app/enum/quellen-status';
import { Beistellung } from 'src/app/enum/beistellung';
import { LeiterplattenStatus } from 'src/app/enum/leiterplattenStatus';
import { UtilUrl } from 'src/app/utils/util.url';
import { BauteilOptionStatus } from 'src/app/enum/bauteilOptionenStatus';
import { UtilBauteileFiltern } from 'src/app/utils/util.bauteile-filtern';

@Component({
  selector: 'mpl-auftraege-zusammenfassung',
  templateUrl: './auftraege-zusammenfassung.component.html',
  styleUrl: './auftraege-zusammenfassung.component.scss'
})
export class AuftraegeZusammenfassungComponent {
  neues_projekt: boolean = false;
  neuer_auftrag: boolean = false;
  auftrag_fortfahren: boolean = false;

  bereit: boolean = false;
  bitte_warten_angebot_erstellen: boolean = false;
  bitte_warten_bauteilOptionenStatus: boolean = false;

  bgnr: any;
  aunr: any;

  bgnrkd: string | undefined;

  agbskd: any;

  baugruppe: any;
  auftrag: any;
  komprimierte_stueckliste: any;
  
  raw_leiterplatte: any;
  leiterplatte: any;
  anzahl_interne_kupferdicke: number = 0;
  formFields: any;
  LeiterplattenStatus = LeiterplattenStatus

  ausgewaehlte_lieferzeit: number = 0;

  displayedColumns__table_nicht_verfuegbar: string[]      = ['pos', 'btnrkd', 'btbeschreibungkd', 'htnrkd', "btnrlikd"];
  nicht_verfuegbare_bauteile: any = new MatTableDataSource<any>();

  displayedColumns__table_teuerste_bauteile: string[]     = ['pos', 'btnrkd', 'btbeschreibungkd', 'htnrkd', "btnrlikd", 'lieferZeit', 'beschaffungsmenge', 'gesamtpreis'];
  fuenf_teuerste_bauteile: any = new MatTableDataSource<any>();

  displayedColumns__table_laengsten_lieferzeit: string[]  = ['pos', 'btnrkd', 'btbeschreibungkd', 'htnrkd', "btnrlikd", 'lieferZeit', 'beschaffungsmenge', 'gesamtpreis'];
  fuenf_laengsten_lieferzeit: any = new MatTableDataSource<any>();

  displayedColumns__table_lieferzeit: string[] =  ['ankreuzfeld', 'name', 'lieferung', "preisprobaugruppe", 'gesamtpreis'];
  wunschtermine: any = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(false, []);

  // Stücklisten Daten / BOM Daten
  bauteile_gesamt: number = 0
  smd_bauteile: number = 0
  tht_bauteile: number = 0
  verfuegbar: number = 0
  nicht_verfuegbar: number = 0
  beistellungen: number = 0
  nicht_bestuecken: number = 0
 
  date_array: Date[] = [];
  heute: Date = new Date();

  gesamtkosten_mit_lieferkosten: number[] = []
  gesamtkosten_pro_baugruppe_mit_lieferkosten: number[] = []

  bauteilOptionStatus = BauteilOptionStatus

  private routerEventsSubscription!: Subscription;
  private nextUrl: string | null = null;

  constructor(
    private backend: BackendService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mitteilungService: MitteilungService
  ) {
    if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
      this.neues_projekt = true;
    }else if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
      this.neuer_auftrag = true;
    }else if(this.router.url.includes(UtilUrl.angebotFortfahren.angebote[0])){
      this.auftrag_fortfahren = true;
    }

    this.aunr = this.activatedRoute.snapshot.paramMap.get('aunr');
    this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
  }

  ngOnInit(){
    const promises: Promise<any>[] = [
      this.GetEinenAuftrag(this.aunr),
      this.GetFormFields()
    ]
    
    // Warte bis alle Anfragen geladen sind
    Promise.all(promises).then((value:any)=>{
      // Sobald der Auftrag und Wunschtermin geladen sind, sollen durch alle Wunschtermine durch gegangen werden
      if(this.auftrag && this.wunschtermine){
        
        this.wunschtermine.data.forEach((element: any) => {
          // GesamtPreise für jede Lieferoption berechnen
          const tmp_gesamtkosten_mit_lieferkosten = parseFloat(this.auftrag[0].gesamtkosten_ohne_lieferkosten) + (parseFloat(element.info) / 100 * parseFloat(this.auftrag[0].gesamtkosten_ohne_lieferkosten))
          const tmp_gesamtkosten_mit_lieferkosten_pro_baugruppe = parseFloat(this.auftrag[0].gesamtkosten_ohne_lieferkosten_pro_baugruppe) + (parseFloat(element.info) / 100 * parseFloat(this.auftrag[0].gesamtkosten_ohne_lieferkosten_pro_baugruppe))

          this.gesamtkosten_mit_lieferkosten.push(
            tmp_gesamtkosten_mit_lieferkosten
          )

          this.gesamtkosten_pro_baugruppe_mit_lieferkosten.push(
            tmp_gesamtkosten_mit_lieferkosten_pro_baugruppe
          )

          // Liefertermine für jede Lieferoption berechnen
          let tmp_date = new Date();
          tmp_date.setDate(
            this.heute.getDate()  
            + this.auftrag[0].liefertage
            - this.auftrag[0].wunschtermin // Wunschtermin ist in Liefertage bereits enthalten. Ausgewählten Wunschtermin subtrahieren
            + element.value              // Wunschtermin addieren   
          );
          this.date_array.push(tmp_date)
        });

        this.bereit = true;
      }

      // Falls der Auftrag bestellt ist, soll der ausgewählte Wunschtermin in der Tabelle angezeigt werden.
      // Es kann kein anderer Termin ausgewählt werden
      if(this.auftrag[0].bestellt == 1){
        let liefertermin = this.auftrag[0].wunschtermin
        let select_liefertermin = this.wunschtermine.data.find((wunschtermin: any) => wunschtermin.value === liefertermin)

        this.change_selection(select_liefertermin);
      }
    })

    // Bekomme die URL, wohin die Seite weitergeleitet wird
    this.routerEventsSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.nextUrl = event.url; // Capture the next URL before navigation starts
      }
    });
  }

  ngOnDestroy(){
    this.routerEventsSubscription.unsubscribe();
    
    if(!this.auftrag_fortfahren){
      UtilAngebotLoeschen.AngebotSollGeloeschtWerden(this.backend, this.nextUrl, this.aunr)
    }

    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetStueckliste(bgnr: any) {
    return new Promise((resolve, reject) => {
      // Füge Spinning in die Objekte ein
      let subscription = this.backend
        .GetAuftragStuecklisteMitBQ(this.aunr)
        .subscribe((value) => {
          subscription.unsubscribe();

          if (value !== false) {
            // Stücklisten Daten / BOM Daten
            const verfuegbar = UtilBauteileFiltern.verfuegbare_bauteile(value)
            const nicht_verfuegbar = UtilBauteileFiltern.nicht_verfuegbare_bauteile(value)
            
            let fuenf_teuersten_bauteile: any[] = [];
            let fuenf_laengsten_lieferzeiten: any[] = [];
            if(verfuegbar && verfuegbar.length > 0){
              fuenf_teuersten_bauteile = UtilBauteileFiltern.auftrags_top_5_bauteile_teuersten_bauteile(verfuegbar) 
              fuenf_laengsten_lieferzeiten = UtilBauteileFiltern.auftrags_top_5_bauteile_laengsten_lieferzeiten(verfuegbar); 
            }

            this.nicht_verfuegbare_bauteile.data = nicht_verfuegbar ?? [];
            this.fuenf_teuerste_bauteile.data = fuenf_teuersten_bauteile;
            this.fuenf_laengsten_lieferzeit.data = fuenf_laengsten_lieferzeiten;

            this.bauteile_gesamt   = value.length;
            this.nicht_verfuegbar  = nicht_verfuegbar.length;
            this.verfuegbar        = verfuegbar.length;
            this.beistellungen     = UtilBauteileFiltern.beistellungen(value).length;
            this.nicht_bestuecken  = UtilBauteileFiltern.nicht_bestueckte_bauteile(value).length;
          }
          resolve(value);
        }, (error: any) => {
          console.error(error)
          subscription.unsubscribe();
          resolve(false);
        });
    });
  }

  GetEineBaugruppe(bgnr: any){
    let subscription = this.backend
      .GetBaugruppen(bgnr)
      .subscribe((value) => {
        subscription.unsubscribe();

        if (value !== false) {
          this.baugruppe = value;
        }
      });
  }

  GetEinenAuftrag(aunr: any){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend
        .GetAuftraege(aunr)
        .subscribe((value) => {
          subscription.unsubscribe();
          
          if (value !== false) {
            this.auftrag = value;
            //this.auftrag[0].gesamtkosten = this.change_preise(this.auftrag[0].gesamtkosten) 
            //this.auftrag[0].kostenprobg = this.change_preise(this.auftrag[0].kostenprobg) 
          
            this.auftrag[0].gesamtkosten = parseFloat(this.auftrag[0].gesamtkosten)
            this.auftrag[0].kostenprobg = parseFloat(this.auftrag[0].kostenprobg)

            this.bgnrkd = this.auftrag[0].bgnrkd;

            this.GetEineBaugruppe(this.bgnr);
            this.GetStueckliste(this.bgnr);
            this.GetLeiterplatte(this.bgnr);
          }

          resolve(value);
        }, (error)=>{
          console.error(error)
          reject(error);
        });
    })
    
  }

  GetLeiterplatte(bgnr: any){
    let subscription1 = this.backend.GetLeiterplatte(bgnr).subscribe((value) => {
      subscription1.unsubscribe();

      if (value !== false) {
        this.raw_leiterplatte = {... value}
        this.leiterplatte = {... value}

        let lagen = parseInt(this.leiterplatte?.["lagen"] ?? "1")
        const count = Math.ceil(lagen / 2) - 1;
        this.anzahl_interne_kupferdicke = count;

        this.GetLeiterplattenFormFields()
      }
    });
  }

  GetLeiterplattenFormFields(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.GetFormFields("mplleiterplatte").subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.formFields = value;

          // Sobald die Leiterplatte und deren FormFields geladen sind, 
          // soll die Leiterplatte Variable mit den Werten aus dem FormField ersetzt werden, 
          // um es in HTML anzuzeigen 
          if(this.leiterplatte && this.formFields){

            if(this.formFields){

              const getNameFromValue = (
                array_json: any
                , value: number | string
              ) : null | string => {
                let json
                if(array_json){
                  json = array_json.find((tmp_json: any) => tmp_json["value"] === value)
                }

                if(!json){
                  return "Error";
                }

                return json?.['name'] ?? "";
              }
              //#region getNameFromValue
              // Karbondruck
              this.leiterplatte['carbon'] = getNameFromValue(
                this.formFields['carbon']
                , this.leiterplatte['carbon']
              );

              // Datums-Kennzeichnung
              this.leiterplatte['datecode'] = getNameFromValue(
                this.formFields['datecode']
                , this.leiterplatte['datecode']
              );

              // Leiterplattendicke
              this.leiterplatte['dicke'] = getNameFromValue(
                this.formFields['dicke']
                , this.leiterplatte['dicke']
              );

              // Durchkontaktierte Schlitze
              this.leiterplatte['dkschlitze'] = getNameFromValue(
                this.formFields['dkschlitze']
                , this.leiterplatte['dkschlitze']
              );

              // E-Test
              this.leiterplatte['etest'] = getNameFromValue(
                this.formFields['etest']
                , this.leiterplatte['etest']
              );

              // Fasung
              this.leiterplatte['fasung'] = getNameFromValue(
                this.formFields['fasung']
                , this.leiterplatte['fasung']
              );

              // Oberflächen-Finish
              this.leiterplatte['finish'] = getNameFromValue(
                this.formFields['finish']
                , this.leiterplatte['finish']
              );

              // Fräsen
              this.leiterplatte['fraesen'] = getNameFromValue(
                this.formFields['fraesen']
                , this.leiterplatte['fraesen']
              );

              // IPC-Klasse
              this.leiterplatte['ipcklasse'] = getNameFromValue(
                this.formFields['ipcklasse']
                , this.leiterplatte['ipcklasse']
              );

              // Kantenmetallisierung
              this.leiterplatte['kantenverzinnung'] = getNameFromValue(
                this.formFields['kantenverzinnung']
                , this.leiterplatte['kantenverzinnung']
              );

              // Externe Kupferdicke
              this.leiterplatte['externekupferdicke'] = getNameFromValue(
                this.formFields['kupferextern']
                , this.leiterplatte['externekupferdicke']
              );

              // Interne Kupferdicke 1
              this.leiterplatte['internekupferdicke1'] = getNameFromValue(
                this.formFields['kupferintern1']
                , this.leiterplatte['internekupferdicke1']
              );

              // Interne Kupferdicke 2
              this.leiterplatte['internekupferdicke2'] = getNameFromValue(
                this.formFields['kupferintern2']
                , this.leiterplatte['internekupferdicke2']
              );

              // Interne Kupferdicke 3
              this.leiterplatte['internekupferdicke3'] = getNameFromValue(
                this.formFields['kupferintern3']
                , this.leiterplatte['internekupferdicke3']
              );

              // Interne Kupferdicke 4
              this.leiterplatte['internekupferdicke4'] = getNameFromValue(
                this.formFields['kupferintern4']
                , this.leiterplatte['internekupferdicke4']
              );

              // Interne Kupferdicke 5
              this.leiterplatte['internekupferdicke5'] = getNameFromValue(
                this.formFields['kupferintern5']
                , this.leiterplatte['internekupferdicke5']
              );

              // Interne Kupferdicke 6
              this.leiterplatte['internekupferdicke6'] = getNameFromValue(
                this.formFields['kupferintern6']
                , this.leiterplatte['internekupferdicke6']
              );

              // Interne Kupferdicke 7
              this.leiterplatte['internekupferdicke7'] = getNameFromValue(
                this.formFields['kupferintern7']
                , this.leiterplatte['internekupferdicke7']
              );

              // Interne Kupferdicke 8
              this.leiterplatte['internekupferdicke8'] = getNameFromValue(
                this.formFields['kupferintern8']
                , this.leiterplatte['internekupferdicke8']
              );

              // Interne Kupferdicke 9
              this.leiterplatte['internekupferdicke9'] = getNameFromValue(
                this.formFields['kupferintern9']
                , this.leiterplatte['internekupferdicke9']
              );

              // Interne Kupferdicke 10
              this.leiterplatte['internekupferdicke10'] = getNameFromValue(
                this.formFields['kupferintern10']
                , this.leiterplatte['internekupferdicke10']
              );

              // Interne Kupferdicke 11
              this.leiterplatte['internekupferdicke11'] = getNameFromValue(
                this.formFields['kupferintern11']
                , this.leiterplatte['internekupferdicke11']
              );

              // Interne Kupferdicke 12
              this.leiterplatte['internekupferdicke12'] = getNameFromValue(
                this.formFields['kupferintern12']
                , this.leiterplatte['internekupferdicke12']
              );

              // Anzahl der Lagen
              this.leiterplatte['lagen'] = getNameFromValue(
                this.formFields['lagen']
                , this.leiterplatte['lagen']
              );

              // Lagenaufbau
              this.leiterplatte['lagenaufbau'] = getNameFromValue(
                this.formFields['lagenaufbau']
                , this.leiterplatte['lagenaufbau']
              );

              // Leiterplattentyp
              this.leiterplatte['lptyp'] = getNameFromValue(
                this.formFields['lptyp']
                , this.leiterplatte['lptyp']
              );

              // Lötstopplack
              this.leiterplatte['ls'] = getNameFromValue(
                this.formFields['ls']
                , this.leiterplatte['ls']
              );

              // LSdoppelt
              this.leiterplatte['lsdoppelt'] = getNameFromValue(
                this.formFields['lsdoppelt']
                , this.leiterplatte['lsdoppelt']
              );

              // Lötstopplackfarbe
              this.leiterplatte['lsfarbe'] = getNameFromValue(
                this.formFields['lsfarbe']
                , this.leiterplatte['lsfarbe']
              );

              // Basismaterial
              this.leiterplatte['material'] = getNameFromValue(
                this.formFields['material']
                , this.leiterplatte['material']
              );

              // Material CTI Wert
              this.leiterplatte['materialctiwert'] = getNameFromValue(
                this.formFields['materialctiwert']
                , this.leiterplatte['materialctiwert']
              );

              // MaterialHalogenFrei
              this.leiterplatte['materialhalogenfrei'] = getNameFromValue(
                this.formFields['materialhalogenfrei']
                , this.leiterplatte['materialhalogenfrei']
              );

              // Keine X-Out im Nutzen
              this.leiterplatte['nutzenkeinexout'] = getNameFromValue(
                this.formFields['nutzenkeinexout']
                , this.leiterplatte['nutzenkeinexout']
              );

              // Nutzentyp
              this.leiterplatte['nutzenTyp'] = getNameFromValue(
                this.formFields['nutzentyp']
                , this.leiterplatte['nutzenTyp']
              );

              // Positionsdruck
              this.leiterplatte['pd'] = getNameFromValue(
                this.formFields['pd']
                , this.leiterplatte['pd']
              );

              // Positionsdruck Farbe
              this.leiterplatte['pdfarbe'] = getNameFromValue(
                this.formFields['pdfarbe']
                , this.leiterplatte['pdfarbe']
              );

              // Abziehlack
              this.leiterplatte['peeling'] = getNameFromValue(
                this.formFields['peeling']
                , this.leiterplatte['peeling']
              );

              // Press-Fit
              this.leiterplatte['pressfit'] = getNameFromValue(
                this.formFields['pressfit']
                , this.leiterplatte['pressfit']
              );

              // Ritzen
              this.leiterplatte['ritzen'] = getNameFromValue(
                this.formFields['ritzen']
                , this.leiterplatte['ritzen']
              );

              // RoHS-Kennzeichnung
              this.leiterplatte['rohssign'] = getNameFromValue(
                this.formFields['rohssign']
                , this.leiterplatte['rohssign']
              );

              // Senkungen
              this.leiterplatte['senkungen'] = getNameFromValue(
                this.formFields['senkungen']
                , this.leiterplatte['senkungen']
              );

              // Sprungritzen
              this.leiterplatte['sprungritzen'] = getNameFromValue(
                this.formFields['sprungritzen']
                , this.leiterplatte['sprungritzen']
              );

              // Spulentechnik
              this.leiterplatte['spulentechnik'] = getNameFromValue(
                this.formFields['spulentechnik']
                , this.leiterplatte['spulentechnik']
              );

              // Stiffener
              this.leiterplatte['stiffener'] = getNameFromValue(
                this.formFields['stiffener']
                , this.leiterplatte['stiffener']
              );

              // UL-Kanada
              this.leiterplatte['ulkanada'] = getNameFromValue(
                this.formFields['ulkanada']
                , this.leiterplatte['ulkanada']
              );

              // UL-Kennzeichnung
              this.leiterplatte['ulsign'] = getNameFromValue(
                this.formFields['ulsign']
                , this.leiterplatte['ulsign']
              );

              // Via Typ
              this.leiterplatte['viatyp'] = getNameFromValue(
                this.formFields['viatyp']
                , this.leiterplatte['viatyp']
              );

              // Z-Achsen Fräsen
              this.leiterplatte['zachsenfraesen'] = getNameFromValue(
                this.formFields['zachsenfraesen']
                , this.leiterplatte['zachsenfraesen']
              );

              // Z-Achsen Fräsen Tiefe
              this.leiterplatte['zachsenfraesentiefe'] = getNameFromValue(
                this.formFields['zachsenfraesentiefe']
                , this.leiterplatte['zachsenfraesentiefe']
              );
              //#endregion
            }
          }
        }
        resolve(true);
      }, (error: any)=>{
        console.error(error)
        reject(error);
      });
    })
  }

  GetFormFields(){
    return new Promise((resolve, reject)=>{
      let subscription = this.backend.GetWunschtermin().subscribe((value) => {
        subscription.unsubscribe();
  
        if (value !== false) {
          this.wunschtermine = new MatTableDataSource(value);
  
          // Den Standard in der Tabelle als ausgewählt markieren
          const standard = value.filter((tmp_value: any) => tmp_value?.standard == 1);
          this.selection.toggle(standard[0])
        }
  
        resolve(value);
      }, (error)=>{
        console.error(error)
        reject(error);
      });
    })
  }
  //#endregion
  //#region Tabelle
    /** Die Beschriftung für das Ankreuzfeld in der übergebenen Zeile */
  checkboxLabel(row?: any): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  change_selection(row: any): void {
    this.selection.clear() 
    this.selection.toggle(row)
  }
  //#endregion
  //#region funktionen
  ExcelOderPdfDownload(excel: boolean){
    let subscription = this.backend.DownloadAuftragsStuecklisteExcelOderPDF(
      this.aunr,
      excel
    ).subscribe((value) => {
      subscription.unsubscribe();
    });
  }
  
  //#endregion
  //#region Umleitung
  bauteiloptionkd_aendern(tmp_bauteilOptionenStatus: BauteilOptionStatus){
    this.bitte_warten_bauteilOptionenStatus = true

    if(this.neues_projekt || this.neuer_auftrag){
      this.baugruppe[0].bauteiloptionkd = tmp_bauteilOptionenStatus 

      let subscription_baugruppe = this.backend.UpdateBaugruppe(this.baugruppe[0]).subscribe((value)=>{
        subscription_baugruppe.unsubscribe();

        this.bitte_warten_bauteilOptionenStatus = false

        if(this.neues_projekt){
          this.router.navigate(UtilUrl.neuesProjekt.bom(this.bgnr))
        }else if(this.neuer_auftrag){
          this.router.navigate(UtilUrl.neuesAngebot.bom(this.bgnr))
        }
      })
    }
  }

  zurueck(){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.vergleichen(this.bgnr, this.aunr))
    }else if(this.neuer_auftrag){
      this.router.navigate(UtilUrl.neuesAngebot.vergleichen(this.bgnr, this.aunr))
    }else if(this.auftrag_fortfahren){
      this.router.navigate(UtilUrl.angebotFortfahren.vergleichen(this.bgnr, this.aunr))
    }else{
      this.router.navigate(UtilUrl.angebote.vergleichen(this.bgnr, this.aunr))
    }
  }

  umleiten_nach_angebot_bestaetigen(){
    this.bitte_warten_angebot_erstellen = true;

    if(this.neues_projekt || this.neuer_auftrag || this.auftrag_fortfahren){
      let subscription = this.backend.LieferoptionBestaetigen({
        'aunr': this.aunr,
        'baugruppe': {
          'bgnr': this.bgnr
        }
      }, this.selection.selected[0].value).subscribe((value) => {
        subscription.unsubscribe();
    
        if (value !== false) {
          if(this.neues_projekt){
            this.router.navigate(UtilUrl.neuesProjekt.bestaetigen(this.bgnr, this.aunr))
          }else if (this.neuer_auftrag) {
            this.router.navigate(UtilUrl.neuesAngebot.bestaetigen(this.bgnr, this.aunr))
          }else if (this.auftrag_fortfahren) {
            this.router.navigate(UtilUrl.angebotFortfahren.bestaetigen(this.bgnr, this.aunr))
          }else {
  
          }
        }
  
        this.bitte_warten_angebot_erstellen = false;
      });
    }else{
      this.router.navigate(UtilUrl.angebote.bestaetigen(this.bgnr, this.aunr))
    }
  }

  umleiten_nach_bom_pruefen(){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.bom(this.bgnr))
    }else if (this.neuer_auftrag) {
      this.router.navigate(UtilUrl.neuesAngebot.bom(this.bgnr))
    }
  }
  //#endregion
  //#region sonstiges
  change_preise(preis: number) {
    let rounded_number = Math.round(preis * 100) / 100
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
      rounded_number
    )
  }
  //#endregion
}
