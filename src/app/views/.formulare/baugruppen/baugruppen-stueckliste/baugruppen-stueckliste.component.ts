import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouteConfigLoadEnd } from '@angular/router';
import { filter, take, tap, timeout } from 'rxjs';

import { BackendService } from 'src/app/services/backend.service';
import { getTrigger } from 'src/app/services/table.service'

import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { DialogComponent } from 'src/app/views/.children/dialog/dialog.component';
import { AlternativesBauteilBearbeitenComponent } from 'src/app/views/.children/alternatives-bauteil-bearbeiten/alternatives-bauteil-bearbeiten.component';

import { UtilFormular } from 'src/app/utils/util.formular';
import { UtilDialog } from 'src/app/utils/util.dialog';
import { UtilUrl } from 'src/app/utils/util.url';
import { UtilBauteileFiltern } from 'src/app/utils/util.bauteile-filtern';

import { QuellenStatus } from 'src/app/enum/quellen-status';
import { Beistellung } from 'src/app/enum/beistellung';

@Component({
    selector: 'mpl-baugruppen-stueckliste',
    templateUrl: './baugruppen-stueckliste.component.html',
    styleUrls: ['./baugruppen-stueckliste.component.scss'],
    animations: getTrigger
})
export class BaugruppenStuecklisteComponent implements OnInit {

    neues_projekt: boolean = false;
    neuer_auftrag: boolean = false;

    top_teuersten_bauteile: number[] = []
    top_laengste_lieferzeit: number[] = []

    bgnr: any
    bgnrkd: string = ""
    
    filterAll:string = ""

    komprimiert: boolean = true;

    ErsteOriginalColoums: Array<string>  = [ "select", "bompos", "btnrkd", "btbeschreibungkd", "htnrkd", "anzprobg", "slbemerkungkd", "loeschen"];
    ZweiteOriginalColoums: Array<string> = [ ];
    OriginalStueckliste: MatTableDataSource<any> = new MatTableDataSource();

    ErsteKomprimiertColoums: Array<string>  = [ "select", "soll", "bompos", "btnrkd", "btbeschreibungkd",     "htnrkd",     "lieferZeit",     "gesamtpreis",     "anzprobgkomp", "bauteil_suchen", "verfuegbar",     "technDaten",             "slbemerkungkd", "loeschen"];
    ZweiteKomprimiertColoums: Array<string> = [ "leer",   "ist",  "leer",   "leer",   "ist-btbeschreibungkd", "ist-htnrkd", "ist-lieferZeit", "ist-gesamtpreis", "leer",         "leer",           "ist-verfuegbar", "technDaten-ohne-header", "leer",          "leer"];
    KomprimiertStueckliste: MatTableDataSource<any> = new MatTableDataSource();

    ErsteSelectedColoums: Array<string> = this.ErsteKomprimiertColoums;
    ZweiteSelectedColoums: Array<string> = this.ZweiteKomprimiertColoums;
    selectedStueckliste: MatTableDataSource<any> = new MatTableDataSource();

    baugruppenmenge: number | undefined;

    @ViewChild(MatPaginator) paginator: MatPaginator | any;

    selection: any = new SelectionModel<any>(true, []);

    @ViewChild("komp") radiobutton_komp: any

    expandedElement: any | null | undefined;
    hoveredElement: any = null; // Wenn die Maus über eine Zeile ist, soll es aufleuchten

    selected_linamekd: string|undefined = undefined;

    bauteile: any[] = [];

    aglakd: any[] = []
    aghakd: any[] = []
    agbskd: any[] = []
    agbtkd: any[] = []

    linamekd: any[] = []

    abbrechen: AbortController[] = []

    bereit: boolean = false;

    bereit_alle_verfuegbarkeiten:boolean = true;
    bereit_eine_verfuegbarkeit:boolean = true;
    bitte_warten_weiter: boolean = false;

    // Für den Ladebalken
    fertig_gepruefte_bt: number = 0;
    prozent_fertig_gepruefte_bt: number = 0;

    QuellenStatus = QuellenStatus
    Beistellung = Beistellung

    constructor(
        private backend: BackendService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog
    ) {
        let tmp_baugruppenmenge = localStorage.getItem("baugruppenmenge")
        if(tmp_baugruppenmenge){
            this.baugruppenmenge = parseInt(tmp_baugruppenmenge);
        }

        if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
            this.neues_projekt = true;
        }
        if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
            this.neuer_auftrag = true;
        }
    }

    ngOnInit(): void {
        this.bgnr = this.activatedRoute.snapshot.paramMap.get('bgnr');
        if(this.bgnr){
            if(this.neues_projekt || this.neuer_auftrag){
                this.GetStueckliste(this.bgnr).then((data: any) => {
                    this.bereit = true;

                    if(data != false){
                        
                        /*
                        const abort = new AbortController()
                        this.abbrechen.push(abort)
                        const signal = abort.signal;
                        
                        var data_ungeprueft = data.filter( (tmp_value: any) => 
                            tmp_value?.komprimierung == 1 
                            && tmp_value?.maxlbverfuegbar == QuellenStatus.NICHT_GEPRUEFT 
                            && tmp_value?.agbskd == Beistellung.BESCHAFFUNG
                        );
                        if(data_ungeprueft.length > 0){
                            this.bestimmte_verfuegbarkeiten_pruefen(data_ungeprueft, signal)
                        }
                        */

                        this.alle_verfuegbarkeiten_pruefen();
                    }
                })
            }else{
                this.GetStueckliste(this.bgnr)
            }
            
            this.GetEineBaugruppe(this.bgnr)
        }

        this.GetBauteile();

        this.GetFormFields();
        this.GetLieferanten();
    }

    ngOnDestroy(){
        this.abbrechen.forEach((abort: AbortController) => abort.abort())
    }

    //#region GET
    GetStueckliste(bgnr: any) {
        this.bereit = false;
        return new Promise((resolve, reject) => {
            // Füge Spinning in die Objekte ein
            let subscription = this.backend
            .GetStueckliste(bgnr)
            .subscribe((value) => {
                subscription.unsubscribe();

                this.bereit = true;

                var komprimierteValue: any
                if (value !== false) {
                    // Füge Spinning in die Objekte ein
                    let value_mit_spinning: any = value;
                    value_mit_spinning.forEach((element: any) => {
                        element.spinning = false;
                    });

                    this.OriginalStueckliste = new MatTableDataSource(value_mit_spinning);

                    komprimierteValue = UtilBauteileFiltern.komprimierte_bauteile(value_mit_spinning);
                    this.KomprimiertStueckliste =  new MatTableDataSource(komprimierteValue);

                    this.OriginalStueckliste._updateChangeSubscription()
                    this.KomprimiertStueckliste._updateChangeSubscription()

                    this.onRadioChange({value: "slkomp"})

                    this.BauteileFiltern()
                }

                resolve(komprimierteValue ?? false);
            }, (error: any) => {
                console.log(error)
                this.bereit = true;

                subscription.unsubscribe();
                resolve(false);
            });
        });
    }

    GetBauteile(){
        let subscription = this.backend
            .GetBauteile()
            .subscribe((value) => {
                subscription.unsubscribe();
                if (value !== false) {
                    if(Array.isArray(value)){
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

    GetLieferanten(){
        let subscription = this.backend.GetLieferant().subscribe((value) => {
            subscription.unsubscribe();
            if (value !== false) {
                this.linamekd = value;
            }
        });
    }

    GetFormFields(){
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

    GetEineBaugruppe(bgnr: any){
        let subscription = this.backend
            .GetBaugruppen(bgnr)
            .subscribe((value) => {
                subscription.unsubscribe();
                if (value !== false) {
                    this.bgnrkd = value[0].bgnrkd
                }
            });
    }
    //#endregion
    //#region Update, Delete
    UpdateStueckliste(element: any) {
        let subscription = this.backend
            .UpdateStuecklistenzeile(element, this.bgnr)
            .subscribe((value) => {
                subscription.unsubscribe();
            });
    }
    loescheStueckliste(
        event: Event | null,
        stueckliste: any = null
    ) {
        if(event){
            event.stopPropagation()
        }

        let length: number
        let stueckliste_name: string
        if(stueckliste){
            length = 1
            stueckliste_name = stueckliste?.btnrkd
        }else{
            length = this.selection.selected.length
            stueckliste_name = this.selection.selected[0].btnrkd
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
            if(stueckliste === null){
                UtilFormular.loopAngularMaterialTableSelection(
                    this.selection
                    , (element: any, resolve: any, reject: any)=>{
                        let subscription2 = this.backend
                            .DeleteStuecklistenzeile(element.slnr)
                            .subscribe((value) => {
                                subscription2.unsubscribe();
                                if (value !== false) {
                                    UtilFormular.loescheZeileDurchID(this.OriginalStueckliste, 'slnr', element.slnr);
                                    UtilFormular.loescheZeileDurchID(this.KomprimiertStueckliste, 'slnr', element.slnr);
                                }
                                resolve(true)
                            },(error)=>{
                                console.error(error)
                                reject(error)
                            });
                    }
                ).then(()=>{
                    this.selection.clear()
                })
            }else{
                let subscription2 = this.backend
                    .DeleteStuecklistenzeile(stueckliste.slnr)
                    .subscribe((value) => {
                        subscription2.unsubscribe();
                        
                        if(value !== false){
                            UtilFormular.loescheZeileDurchID(this.OriginalStueckliste, 'slnr', stueckliste.slnr);
                            UtilFormular.loescheZeileDurchID(this.KomprimiertStueckliste, 'slnr', stueckliste.slnr);
                        }
                    });
            }
            
        })
    }
    //#endregion
    //#region filter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.selectedStueckliste.filter = filterValue.trim().toLowerCase();
    }
    //#endregion
    //#region Funktionen
    async alle_verfuegbarkeiten_pruefen(){
        return new Promise((resolve, reject)=>{
            // Den Ladebalken zurücksetzen
            this.prozent_fertig_gepruefte_bt = -1;

            // Top Bauteile zurücksetzen
            this.top_teuersten_bauteile = [];
            this.top_laengste_lieferzeit = [];

            // Buttons deaktivieren
            this.bereit_alle_verfuegbarkeiten = false;
            
            // breche vorherige Verfügbarkeits Prüfung ab
            if(this.abbrechen.length > 0){
                this.abbrechen.forEach((abort: AbortController) => abort.abort())
            }
            this.abbrechen = []

            const abort = new AbortController()
            this.abbrechen.push(abort)
            const signal = abort.signal;

            // Wechsle zum Komprimierten Ansicht
            if(this.radiobutton_komp?.checked){
                this.radiobutton_komp.checked = true
            }
            this.onRadioChange({value: "slkomp"})

            if(this.selectedStueckliste.data.length > 0){

                let subscription = this.backend.verfuegbarkeitZuruecksetzen("bgnr", this.bgnr, true).subscribe(async (value) => {
                    subscription.unsubscribe();

                    if(value !== false){
                        // Verfügbarkeit in der dataSource auf 0 setzen
                        this.KomprimiertStueckliste.data.forEach((element: any) => {
                            const heute_geprueft = this.heuteGeprueft(element.letzteneuequellezpkt)
                            if(!heute_geprueft){
                                element.maxlbverfuegbar = QuellenStatus.NICHT_GEPRUEFT;
                            }
                        });
                        this.OriginalStueckliste.data.forEach((element: any) => {
                            const heute_geprueft = this.heuteGeprueft(element.letzteneuequellezpkt)
                            if(!heute_geprueft){
                                element.maxlbverfuegbar = QuellenStatus.NICHT_GEPRUEFT;
                            }
                        });
                        this.KomprimiertStueckliste._updateChangeSubscription();
                        this.OriginalStueckliste._updateChangeSubscription();
                        
                        // prüft die Verfügbarkeit von 10 Bauteilen
                        let anzahl_der_pruefenden_bauteile = 10  // In Schleifen wird die 0 mitgezählt, weshalb -1 um auf die Zehn zu kommen

                        if(this.paginator.pageSize < anzahl_der_pruefenden_bauteile){
                            anzahl_der_pruefenden_bauteile = this.paginator.pageSize
                        }

                        // Variablen deklarieren
                        let index0 = 0;
                        let anzahl_der_Seiten = Math.ceil(this.selectedStueckliste.data.length / this.paginator.pageSize);
                        let promise_array_seitenweise = []

                        // prüft die Verfügbarkeit Seitenweise
                        for (let index1 = 0; index1 < anzahl_der_Seiten; index1++) { // Gehe durch alle Seiten
                            for (let index2 = 0; index2 < this.paginator.pageSize; index2++) { // Gehe durch die Seite
                                if (signal.aborted) {
                                    return;
                                }

                                let komp_stuecklisten_zeile = this.selectedStueckliste.data[index0]
                                if(komp_stuecklisten_zeile != undefined
                                && komp_stuecklisten_zeile['agbskd'] != undefined){
                                    if(komp_stuecklisten_zeile['agbskd'] == Beistellung.BESCHAFFUNG){
                                        promise_array_seitenweise.push(
                                            this.verfuegbarkeit_pruefen(komp_stuecklisten_zeile, true, false)
                                        );
                                    }else{
                                        this.add_fertig_gepruefte_bt();
                                    }
                                }

                                if( promise_array_seitenweise.length === anzahl_der_pruefenden_bauteile || index0 === this.selectedStueckliste.data.length){
                                    // Die Async Bauteile prüfen
                                    await Promise.all(promise_array_seitenweise)
                                    promise_array_seitenweise = [];
                                }

                                if(index0 === this.selectedStueckliste.data.length){
                                    break;
                                }

                                index0++;
                            }

                            if(index0 === this.selectedStueckliste.data.length){
                                break;
                            }

                            // Auf die nächste Seite umschlagen
                            this.selectedStueckliste.paginator?.nextPage()
                        }

                        // Wenn alle Bauteile durchgegangen sind, die Daten weiter verarbeiten und wichtige Informationen entnehmen
                        this.BauteileFiltern();

                        this.bereit_alle_verfuegbarkeiten = true;
                    }
                });
            }

        })
    }

    async bestimmte_verfuegbarkeiten_pruefen(data_ungeprueft: any, signal: any){
        // Den Ladebalken zurücksetzen
        this.fertig_gepruefte_bt = 0;
        this.prozent_fertig_gepruefte_bt = -1;
        
        // Buttons deaktivieren
        this.bereit_alle_verfuegbarkeiten = false;
        
        // Überprüfe ob das Signal am Anfang bereits abgebrochen ist
        if (signal.aborted) {
            return;
        }

        // Wechsle zum Komprimierten Ansicht
        if(this.radiobutton_komp){
            this.radiobutton_komp.checked = true
            this.onRadioChange({value: "slkomp"})
        }

        if(this.selectedStueckliste.data.length > 0){
            let anzahl_der_pruefenden_bauteile = 10 

            // Variablen deklarieren
            let index0 = 0;
            let anzahl_der_Seiten = Math.ceil(this.selectedStueckliste.data.length / this.paginator.pageSize);
            let promise_array = []

            // prüft die Verfügbarkeit von 10 Bauteilen
            for (let index1 = 0; index1 < anzahl_der_Seiten; index1++) { // Gehe durch alle Seiten
                for (let index2 = 0; index2 < this.paginator.pageSize; index2++) { // Gehe durch die Seite, aber jeweils nur 10 Bauteile
                    if (signal.aborted) { // Brich die Schleife ab, sobald die Komponente verlassen wird.
                        return;
                    }

                    let komp_stuecklisten_zeile = this.selectedStueckliste.data[index0]
                    if(komp_stuecklisten_zeile != undefined
                    && komp_stuecklisten_zeile['agbskd'] != undefined){
                        if(komp_stuecklisten_zeile['agbskd'] == Beistellung.BESCHAFFUNG){
                            promise_array.push(
                                this.verfuegbarkeit_pruefen(komp_stuecklisten_zeile, true, false)
                            );
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
                this.selectedStueckliste.paginator?.nextPage()
            }
        }
        this.bereit_alle_verfuegbarkeiten = true;
    }

    async eine_verfuegbarkeit_pruefen(element: any, ladebalken_verwenden:boolean = false, message: boolean = true){
        this.bereit_eine_verfuegbarkeit = false;

        return this.verfuegbarkeit_pruefen(element, ladebalken_verwenden, message)
    }

    async verfuegbarkeit_pruefen(element: any, ladebalken_verwenden:boolean = false, message: boolean = true){
        return new Promise((resolve, reject) => {
            element.spinning = true;

            // Wenn das Bauteil heute noch nicht geprueft worden ist, soll es geprueft werden
            const heute_geprueft = this.heuteGeprueft(element.letzteneuequellezpkt)
            if(heute_geprueft){
                element.spinning = false; 
                this.add_fertig_gepruefte_bt();
                resolve(true)
            }else{
                this.backend
                    // .QuellenAktualisieren("SLNR", 1, 0, 0, 0, element.bgnr, element.slnr, 0, element.btnrkd)
                    .QuellenAktualisierenNew("SLNR", 1, 0, element.slnr, element.btnrkd, 0, this.baugruppenmenge, message)
                    .pipe(take(1))
                    .subscribe((value: any) => {

                        // Stücklisten/BOM Zeile soll neugeladen werden, egal ob "value" false oder was anderes ist. 
                        let subscription2 = this.backend
                            .GetStueckliste(element.bgnr, 0, element.slnr)
                            .subscribe((value: any) => {
                                subscription2.unsubscribe();
                
                                element.spinning = false;
                
                                if(value.length == 1){
                                    // Zeile in die Tabelle Laden
                                    let index = this.KomprimiertStueckliste.data.findIndex((value:any)=> value.slnr === element.slnr)
                                    this.KomprimiertStueckliste.data[index] = value[0]
                                    this.KomprimiertStueckliste._updateChangeSubscription();
                                    this.selectedStueckliste._updateChangeSubscription();
                                }

                                // Den Ladebalken erhöhen
                                if(ladebalken_verwenden){
                                    this.add_fertig_gepruefte_bt();
                                }
                                
                                this.bereit_eine_verfuegbarkeit = true;

                                resolve(true)
                            });
                    });
            }
        })
    }
    //#endregion
    //#region Tabellen Funktionen
    onMouseEnter(element: any): void {
        this.hoveredElement = element;
    }

    onMouseLeave(): void {
        this.hoveredElement = null;
    }

    /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
    isAllSelected() {
        return UtilFormular.isAllSelected(this.selection, this.selectedStueckliste.data.length); 
    }

    /** Alle Zeilen auswaehlen oder abwaehlen */
    toggleAllRows() {
        UtilFormular.toggleAllRows(this.selection, this.selectedStueckliste.data.length, this.selectedStueckliste);
    }
    //#endregion
    //#region Input und Select Funktionen
    onRadioChange(event: any) {
        if(event.value == "slkomp"){
            this.komprimiert = true;
            this.ErsteSelectedColoums = [...this.ErsteKomprimiertColoums, 'expand'];
            this.ZweiteSelectedColoums = [...this.ZweiteKomprimiertColoums, 'leer'];
            this.selectedStueckliste = this.KomprimiertStueckliste;
        }else if(event.value == "sl"){
            this.komprimiert = false;
            this.ErsteSelectedColoums = [...this.ErsteOriginalColoums, 'expand'];
            this.ZweiteSelectedColoums = [...this.ZweiteOriginalColoums, 'leer'];
            this.selectedStueckliste = this.OriginalStueckliste;
        }

        this.selectedStueckliste._updateChangeSubscription();

        // Auf die erste Seite umschlagen
        this.selectedStueckliste.paginator?.firstPage()
        this.selectedStueckliste.paginator = this.paginator;
    }

    lieferant_change(event: any, element: any){
        // finde die ausgewählte Baugruppe durch bgnrkd
        if(!this.linamekd){
            return
        }
        if(!event?.target || !event?.target.value){
            return
        }
        let ausgewaehlteLieferant: any = this.linamekd.findIndex(x => x.LINR == event.target.value);
        
        // ändere die zu verändernden Auftrag mit dem ausgewählten Baugruppe
        element['LINR'] = this.linamekd[ausgewaehlteLieferant]['LINR'];
        element.linamekd = this.linamekd[ausgewaehlteLieferant].Lieferantenname
    }

    change_baugruppenmenge(){
        if(this.baugruppenmenge){
            localStorage.setItem("baugruppenmenge", this.baugruppenmenge.toString())
        }
    }
    //#endregion
    //#region Beistellung und nicht bestücken
    Bauteil_als_beschaffen_umstellen(event: any, stuecklisten_zeile: any){
        if(event){
            event.stopPropagation(); // Verhindert den Click-Event vom Eltern-Element
        }

        if(stuecklisten_zeile){
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
                        if(result){
                            stuecklisten_zeile.spinning = true

                            const tmp_stuecklisten_zeile = {...stuecklisten_zeile}
                            tmp_stuecklisten_zeile.agbskd = Beistellung.BESCHAFFUNG;
                            let subscription = this.backend
                                .UpdateStuecklistenzeile(tmp_stuecklisten_zeile, this.bgnr)
                                .subscribe((value) => {
                                    subscription.unsubscribe();
                                    
                                    if (value !== false) {
                                        stuecklisten_zeile.agbskd = Beistellung.BESCHAFFUNG;
                                        //this.GetStueckliste(this.bgnr)
                                    }

                                    stuecklisten_zeile.spinning = false
                                });
                        }
                    });
        }
    }

    Bauteil_als_beigestellt_umstellen(event: any, stuecklisten_zeile: any){
        event.stopPropagation(); // Verhindert den Click-Event vom Eltern-Element

        if(stuecklisten_zeile){
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
                        if(result){
                            stuecklisten_zeile.spinning = true

                            const tmp_stuecklisten_zeile = {...stuecklisten_zeile}
                            tmp_stuecklisten_zeile.agbskd = Beistellung.BEISTELLUNG;
                            let subscription = this.backend
                                .UpdateStuecklistenzeile(tmp_stuecklisten_zeile, this.bgnr)
                                .subscribe((value) => {
                                    subscription.unsubscribe();
                                    
                                    if (value !== false) {
                                        stuecklisten_zeile.agbskd = Beistellung.BEISTELLUNG;
                                        //this.GetStueckliste(this.bgnr)
                                    }

                                    stuecklisten_zeile.spinning = false
                                });
                        }
                    });
        }
    }
    
    Bauteil_als_nicht_bestuecken_umstellen(event: any, stuecklisten_zeile: any){
        event.stopPropagation(); // Verhindert den Click-Event vom Eltern-Element

        if(stuecklisten_zeile){
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
                    if(result){
                        stuecklisten_zeile.spinning = true
                        const tmp_stuecklisten_zeile = {...stuecklisten_zeile}
                        tmp_stuecklisten_zeile.agbskd = Beistellung.NICHT_BESTUECKEN;
                        let subscription = this.backend
                            .UpdateStuecklistenzeile(tmp_stuecklisten_zeile, this.bgnr)
                            .subscribe((value) => {
                                subscription.unsubscribe();
                
                                if (value !== false) {
                                    stuecklisten_zeile.agbskd = Beistellung.NICHT_BESTUECKEN;
                                    //this.GetStueckliste(this.bgnr)
                                }

                                stuecklisten_zeile.spinning = false
                            });
                    }
                });
        }
    }
    //#endregion
    //#region Alternativ
    alternative_suche(event: any, element: any){
        event.stopPropagation(); // Verhindert den Click-Event vom Eltern-Element
        
        if(this.baugruppenmenge){
            localStorage.setItem("bauteil", JSON.stringify(element))
            this.navigateZumAlternativenBauteilSuchen(element.slnr)
        }
    }

    alternative_bearbeiten(event: any, element: any){
        event.stopPropagation(); // Verhindert den Click-Event vom Eltern-Element
        
        const dialogRef = this.dialog.open(AlternativesBauteilBearbeitenComponent, {
            data: {
                titel: "Alternatives Bauteil bearbeiten",
                content: undefined,
                buttons: [
                    {
                        name: "Ein anderes Bauteil auswählen",
                        style: "secondary",
                        return: 0
                    },{
                        name: "Bauteil wird von ihnen beigestellt",
                        style: "secondary",
                        return: 1
                    }
                ],
            }
        });
    
        dialogRef.afterClosed()
            .pipe(
                take(1),
                filter((result: any) => result != undefined),   // Abbrechen
            )
            .subscribe((result: any) => { 
                if(result === 0){
                    localStorage.setItem("bauteil", JSON.stringify(element))
                    if(this.baugruppenmenge){
                        localStorage.setItem("baugruppenmenge", this.baugruppenmenge.toString())
                    }

                    this.navigateZumAlternativenBauteilSuchen(element.slnr)
                }else if(result === 1){
                    element.agbskd = Beistellung.BEISTELLUNG;
                    let subscription = this.backend
                        .UpdateStuecklistenzeile(element, this.bgnr)
                        .subscribe((value) => {
                            subscription.unsubscribe();
                            if (value !== false) {
                                
                            }
                        });
                }
            });
    }

    alternatives_loeschen(event: any, element:any){
        event.stopPropagation(); // Verhindert den Click-Event vom Eltern-Element

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
                    .AusgewaehltesAlternativesBauteilLoeschen(element)
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
    //#region PDF oeffnen
    pdf_link_oeffnen(element: any) {
        if(element?.['technDaten']){
            window.open(element.technDaten, "_blank");
        }
    }
    //#endregion
    //#region Umleitung
    zurueck(){
        if(this.neues_projekt){
            this.router.navigate(UtilUrl.neuesProjekt.leiterplatte(this.bgnr))
        }else if(this.neuer_auftrag){
            this.router.navigate(UtilUrl.neuesAngebot.leiterplatte(this.bgnr))
        }else{
            this.router.navigate(UtilUrl.baugruppen.leiterplatte(this.bgnr))
        }
    }

    weiter(){
        if(this.neues_projekt || this.neuer_auftrag){
            this.bitte_warten_weiter = true;

            let createAuftrag = this.backend.AddAuftrag(
                {
                    'baugruppe': { 'bgnr': this.bgnr },
                    'auftragsmenge': this.baugruppenmenge,
                    'auftragsart': 2,
                    'wunschtermin': 0,
                    'aubemerkungkd': ""
                },
                false
            ).subscribe((value: any) => {
                createAuftrag.unsubscribe();

                if(value !== false){
                    if(this.neues_projekt){
                        this.router.navigate(UtilUrl.neuesProjekt.vergleichen(this.bgnr, value))
                    }else if(this.neuer_auftrag){
                        this.router.navigate(UtilUrl.neuesAngebot.vergleichen(this.bgnr, value))
                    }
                }
                
                this.bitte_warten_weiter = false;
            })
        }
    }

    navigateZumAlternativenBauteilSuchen(slnr: any){
        if(this.neues_projekt){
            this.router.navigate(UtilUrl.neuesProjekt.alternativ(this.bgnr, slnr))
        }else if(this.neuer_auftrag){
            this.router.navigate(UtilUrl.neuesAngebot.alternativ(this.bgnr, slnr))
        }else{
            this.router.navigate(UtilUrl.baugruppen.alternativ(this.bgnr, slnr))
        }
    }
    //#endregion
    //#region sonstiges
    private add_fertig_gepruefte_bt(){
        this.fertig_gepruefte_bt++;

        if(this.selectedStueckliste.data.length > 0){
            this.prozent_fertig_gepruefte_bt = this.fertig_gepruefte_bt / this.selectedStueckliste.data.length * 100;
        }
    }

    /* Weil es zu viele Fehler verursacht, wird es deaktiviert */
    private heuteGeprueft(datum_string: string): boolean {
        return false

        const jetzt: Date = new Date();
        const datum: Date = new Date(datum_string);
    
        // Setze beide Zeiten auf Mitternacht, um nur das Datum zu vergleichen
        jetzt.setHours(0, 0, 0, 0);
        datum.setHours(0, 0, 0, 0);

        // Berechne den Unterschied in Tagen
        const diffInDays = (jetzt.getTime() - datum.getTime()) / (1000 * 60 * 60 * 24);

        // Wenn 0, dann wurde das Bauteil heute bereits geprueft
        return diffInDays === 0;
    }

    private BauteileFiltern() {
        const verfuegbar = UtilBauteileFiltern.verfuegbare_bauteile(this.selectedStueckliste.data)
                                
        let top_teuersten_bauteile: any[] = [];
        let top_laengste_lieferzeit: any[] = [];
        if(verfuegbar && verfuegbar.length > 0){
            top_teuersten_bauteile = UtilBauteileFiltern.top_5_bauteile_teuersten_bauteile(verfuegbar) 
            top_laengste_lieferzeit = UtilBauteileFiltern.top_5_bauteile_laengsten_lieferzeiten(verfuegbar); 
        }
        this.top_teuersten_bauteile = top_teuersten_bauteile;
        this.top_laengste_lieferzeit = top_laengste_lieferzeit;
    }
    //#endregion
}
