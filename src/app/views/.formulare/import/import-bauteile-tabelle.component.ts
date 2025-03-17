import { Component, ViewChild, ViewChildren } from '@angular/core';
import { filter, take, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import { BackendService } from 'src/app/services/backend.service';

import { Bauteil } from 'src/app/interfaces/bauteil';
import { Baugruppe } from 'src/app/interfaces/baugruppe';
import { Beistellung } from 'src/app/enum/beistellung';

import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

import { DialogComponent } from '../../.children/dialog/dialog.component';
import { ImportBauteilAnlegenComponent } from './import-bauteil-anlegen/import-bauteil-anlegen.component';

import { MitteilungService } from 'src/app/services/mitteilung.service';
import { getTrigger } from 'src/app/services/table.service'
import { WindowService } from 'src/app/services/window.service';

import { UtilFormular } from 'src/app/utils/util.formular';
import { UtilDialog } from 'src/app/utils/util.dialog';
import { UtilBaugruppe } from 'src/app/utils/util.baugruppe';
import { UtilUrl } from 'src/app/utils/util.url';


@Component({
  selector: 'mpl-import-bauteile-tabelle',
  templateUrl: './import-bauteile-tabelle.component.html',
  styleUrls: ['./import-bauteile-tabelle.component.scss'],
  animations: getTrigger
})
export class ImportBauteileTabelleComponent {
    neues_projekt: boolean;

    filterAll:          string = ""

    ansicht: string = "sl";
    komprimiert: boolean = false

    bt_columnsToDisplay             = ["select", "bompos", "artnrdie", "btnrkd", "btbeschreibungkd", "htnrkd", "linamekd", "btnrlikd", "agbskd", "btbemerkungkd", "loeschen"];

    sl_columnsToDisplay             = ["select", "bompos", "artnrdie", "btnrkd", "btbeschreibungkd", "htnrkd", "anzprobg",     "agbskd", "btbemerkungkd", "loeschen"];
    sl_komprimiertecolumnsToDisplay = ["select", "bompos", "artnrdie", "btnrkd", "btbeschreibungkd", "htnrkd", "anzprobgkomp", "agbskd", "btbemerkungkd", "loeschen"];
    
    expandedElement: any | null | undefined;

    importBauteile: MatTableDataSource<any> = new MatTableDataSource(); // muss nicht angepasst werden
    komprimierteImportBauteile: MatTableDataSource<any> = new MatTableDataSource(); // muss nicht angepasst werden

    selectedColoums: any = [...this.sl_columnsToDisplay, 'expand'];
    selectedBauteile: MatTableDataSource<any> = this.importBauteile

    @ViewChild(MatPaginator) paginator: MatPaginator | any;

    selection: any = new SelectionModel<any>(true, []);

    baugruppen: Baugruppe[] = []

    aglakd: any[] = []
    aghakd: any[] = []
    agbskd: any[] = []
    agbtkd: any[] = []
    
    linamekd: any[] = []

    bereit: boolean = false;
    bitte_warten_excel_hochladen: boolean = false;
    bitte_warten_uebernehmen: boolean = false;
    bitte_warten_speichern: boolean = false;

    @ViewChild(MatSort) sort: MatSort = new MatSort();

    @ViewChildren('datei_input') dateien:   NgForm | any;
    import_konfiguration_ergebnis: any
    nicht_tabelle_loeschen: boolean = false

    @ViewChildren('ng_form')   ng_form:   NgForm | any;
    @ViewChildren('html_form') html_form: NgForm | any;

    @ViewChild('radiobutton_sl') radiobutton_sl: any;

    markieren: number[] = []
    fehlermeldung: any = {}

    files: File[] = []

    // Enums
    Beistellung = Beistellung


    fehlermeldung_baugruppenname: any = {
        "required": "Bitte tragen Sie einen Baugruppen Namen ein!"
        , "bgnrkd_existiert": "Der Name existiert bereits, wählen Sie einen anderen Namen!"
    }

    weiter_clicked: boolean = false;
    
    form_baugruppename: FormGroup = this._formBuilder.group({
        baugruppenname: [
            '', 
            [ 
                Validators.required
            ]
        ]
    })

    constructor(
        private backend: BackendService, 
        private mitteilungService: MitteilungService,
        private dialog: MatDialog,
        private windows: WindowService,
        private router : Router,
        private _formBuilder: FormBuilder
    ) {
        // erhält aus der URL "/import/konfiguration" den Arbeitsblatt, Tabellenkopf, Datenanfang, Datenende und Spalten
        this.import_konfiguration_ergebnis = this.router.getCurrentNavigation()?.extras.state?.['ergebnis'];
        history.replaceState({}, document.title);

        // Falls ein neues Projekt eingerichtet wird, soll durch die Variable "neues_projekt" spezielle Funktionen ausgelöst werden.
        // Aus dem Localstorage wird der baugruppenname entnommen
        if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
            this.neues_projekt = true;

            let tmp_baugruppenname = localStorage.getItem("baugruppenname")
            
            if(tmp_baugruppenname){
                this.form_baugruppename.get("baugruppenname")?.patchValue(tmp_baugruppenname);
            }
        }else{
            this.neues_projekt = false;
        }
    }

    ngOnInit(): void {
        if(this.import_konfiguration_ergebnis && this.import_konfiguration_ergebnis !== false){
            this.excel_hochladen( 
                this.import_konfiguration_ergebnis?.datei
                ,this.import_konfiguration_ergebnis?.arbeitsblatt
                ,this.import_konfiguration_ergebnis?.kopfzeile
                ,this.import_konfiguration_ergebnis?.datenbereich
                ,this.import_konfiguration_ergebnis?.spalten
            );
        }else{
            this.promise_tabelle_loeschen(false).then(()=>{
              this.Get()
            })
        }

        this.GetBaugruppen();
        this.GetFormFields();
        this.GetLieferanten();
    }

    ngOnDestroy(){
        WindowService.closeFehlermeldungen()

        if(!this.nicht_tabelle_loeschen){
            this.promise_tabelle_loeschen(false)
        }

        this.mitteilungService.closeMessage();
    }

    //#region GET
    Get() {
        this.bereit = false;
        return new Promise((resolve, reject) => {
            let subscription = this.backend.ImportBauteilAnzeigen().subscribe((value) => {
                subscription.unsubscribe();
                this.bereit = true;
                if (value !== false) {
                    this.importBauteile = new MatTableDataSource(value);

                    let komprimierteValue = value.filter((tmp_value: any) => tmp_value?.komprimierung === 1);
                    this.komprimierteImportBauteile =  new MatTableDataSource(komprimierteValue); 

                    // Je nachdem, werden komprimierte oder alle Bauteile angezeigt.
                    this.onRadioChange({value: this.ansicht });
                }

                this.bereit = true;
                resolve(true);
            }, (error) => {
                console.error(error)
                reject(error);
            });
        });
    }
    GetBaugruppen() { // Wird nicht verwendet!
        let subscription = this.backend.GetBaugruppen().subscribe((value) => {
            subscription.unsubscribe();
            if (value !== false) {
                this.baugruppen = value;
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
    //#endregion
    //#region create, update, delete
    dialog_import_anlegen(){
        const dialogRef = this.dialog.open(ImportBauteilAnlegenComponent, {
            width: "1350px",
            height: "700px",
            data: {
                neues_projekt: true,
            }
        });

        const dialog_subscription = dialogRef.afterClosed().subscribe(result => {
            dialog_subscription.unsubscribe()
        
            // Tabelle neu laden
            if(result){
                this.alles_pruefen()
            }
        });
    }

    Update(importBauteil: any) {
        this.bitte_warten_speichern = true;

        let subscription = this.backend
            .ImportBauteilUpdate(importBauteil)
            .subscribe((value) => {
                subscription.unsubscribe();
                if (value !== false) {  
                    this.alles_pruefen(false)
                }

                this.bitte_warten_speichern = false;
            });
    }

    import_bauteil_loeschen(
        event: Event | null,
        bauteil: any = null
    ){
        if(event){
            event.stopPropagation()
        }

        let length: number
        let bauteil_name: string
        if(bauteil){
            length = 1
            bauteil_name = bauteil?.btnrkd
        }else{
            length = this.selection.selected.length
            bauteil_name = this.selection.selected[0].btnrkd
        }

        let titel: string;
        let content: string;
        if(length > 1){
            titel = length + " Dateien Löschen";
            content = "Wollen Sie wirklich " + length + " Dateien unwiderruflich löschen?"
        }else{
            titel = "Bauteil '" + bauteil_name + "' Löschen";
            content = "Wollen Sie wirklich die Datei unwiderruflich löschen?"
        }

        UtilDialog.loeschenBestaetigen(
            this.dialog
            ,titel
            ,content
        ).then(()=>{
            if(bauteil === null){
                UtilFormular.loopAngularMaterialTableSelection(
                    this.selection
                    , (element: any, resolve: any, reject: any)=>{
                        let subscription2 = this.backend
                            .ImportBauteilDelete(element.binr)
                            .subscribe((value) => {
                                subscription2.unsubscribe();
                                
                                if(value !== false){
                                    UtilFormular.loescheZeileDurchID(this.selectedBauteile, "binr", element.binr)
                                }

                                resolve(true)
                            },(error)=>{
                                console.error(error)
                                reject(error)
                            });
                    }
                ).then((value)=>{
                    this.Get();
                    this.selection.clear()
                })
            }else{
                let subscription2 = this.backend
                    .ImportBauteilDelete(bauteil.binr)
                    .subscribe((value) => {
                        subscription2.unsubscribe();
                        
                        UtilFormular.loescheZeileDurchID(this.selectedBauteile, "binr", bauteil.binr)
                    });
            }
            
        })
    }

    tabelle_loeschen(nachfragen: boolean = true, meldung: boolean = true){
        if(nachfragen){
            const dialogRef = this.dialog.open(DialogComponent, {
                width: '500px',
                data: {
                    titel: "Komplette Tabelle Löschen",
                    content: "Wollen Sie wirklich die komplette Tabelle unwiderruflich löschen?",
                    ja_button_content: "Tabelle Löschen",
                    ja_button_style: "success",
                    nein_button_exist_not: true
                }
            });
    
            dialogRef.afterClosed().pipe(
                take(1),
                filter((result: any) => result != undefined),   // Abbrechen
                tap((result: any) => {                          // ja: true; nein: false;
                    this.bereit = false;
    
                    this.promise_tabelle_loeschen(meldung).then(
                        (value:any) => {
                            this.bereit = true;
                            if (value !== false) {
                                this.Get()
                            }
                        }
                    );
                })
            ).subscribe();
        }else{
            this.promise_tabelle_loeschen(meldung).then(
                (value:any) => {
                    this.bereit = true;
                    if (value !== false) {
                        this.Get()
                    }
                }
            );
        }
    }

    promise_tabelle_loeschen(meldung: boolean = true): Promise<any>{
        return new Promise((resolve, reject) => {
            let subscription = this.backend.ImportBauteileTabelleLoeschen(meldung).subscribe((value) => {
                subscription.unsubscribe();
                resolve(value);
            }, (error) => {
                console.error(error)
                subscription.unsubscribe();
                reject(error);
            });
        });
    }
    //#endregion
    //#region Funktionen
    alles_pruefen(erfolgsMeldungAnzeigen: boolean = true){
        /**
         * Wenn die benötigten/required Felder geändert werden müssen, muss dafür in PHP unter "class_import" in der Funktion "btpruefen" zwei Bereiche geändert werden.
         * Zum einen in der Funktion `BauteilzeileKomplettErfasst` unter den Kommentar Pflichtfelder.
         * und zum anderen am Ende in der Funktion `SuchenBTNRinBauteilPoolKD` unter dem Kommentar "WeiterAlle". 
         */

        this.bereit = false;

        return new Promise((resolve, reject) => {
            let subscription = this.backend.ImportBauteilAnzeigen().subscribe((value) => {
                subscription.unsubscribe();

                if(value !== false && value.length > 0){
                    let subscriptionKomp = this.backend.ImportStuecklisteKomprimieren(erfolgsMeldungAnzeigen).subscribe((value) => {
                        subscriptionKomp.unsubscribe();
            
                        if (value !== false) {
                            let subscription1 = this.backend
                                .AlleBIPruefdatenloeschen()
                                .subscribe((value:any) => {
                                        subscription1.unsubscribe();
                                        if (value !== false) {
                                            let subscription2 = this.backend
                                                .AlleImportBauteilePruefen(erfolgsMeldungAnzeigen)    
                                                .subscribe((value:any) => {
                                                    subscription2.unsubscribe();
            
                                                    let bt_pruefen_success = value[0]
                                                    let bt_pruefen_result = value[1]
            
                                                    /// Expanded Zeile zusammenklappen, damit beim aufrufen von MatDialog aus 'btpruefen_result_anzeigen' nicht verbuggt.
                                                    // Wenn eine Angular Material Tabelle Zeile ausgeklappt/expanded ist, ein MatDialog aufgerufen wird 
                                                    // und die CSS Klasse: 'body {overflow-y: auto !important;}' verwendet wird,  
                                                    // dann verbuggt sich das Scrollen. 
                                                    this.expandedElement = undefined
            
                                                    if( bt_pruefen_success === false){
                                                        // Import SQL Tabelle wurde geändert, weshalb die Daten neu geladen werden müssen 
                                                        // Es muss in Get() eine weitere Funktion eingebaut werden, weshalb die Funktion erneut hier kopiert wurde
                                                        let subscription3 = this.backend.ImportBauteilAnzeigen().subscribe((value) => {
                                                            subscription3.unsubscribe();
                                                            if (value !== false) {
                                                                this.importBauteile = new MatTableDataSource(value);
                                                                this.importBauteile.data.length = value.length;
                                                
                                                                let komprimierteValue = value.filter((tmp_value: any) => tmp_value?.komprimierung === 1);
                                                                this.komprimierteImportBauteile =  new MatTableDataSource(komprimierteValue);
                                                
                                                                // geänderte Zeilen markieren; fehlende Felder markieren; Neues Fenster öffnen; 
                                                                this.btpruefen_result_anzeigen(bt_pruefen_result);
                                                            }

                                                            this.bereit = true;
                                                            resolve(false);
                                                        });
            
                                                    }else{
                                                        this.markieren = [];
                                                        this.fehlermeldung = {};
            
                                                        let subscription3 = this.backend
                                                            .AlleImportStuecklistenPruefen(erfolgsMeldungAnzeigen)
                                                            .subscribe((value:any) => {
                                                                subscription3.unsubscribe();
                                                                if (value !== false) {
                                                                    this.Get().then(()=>{
                                                                        this.bereit = true;
                                                                        resolve(true);
                                                                    });
                                                                }else{
                                                                    this.bereit = true;
                                                                    resolve(false);
                                                                }
                                                            });
                                                    }
                                                });
                                        }else{
                                            reject(false)
                                        }
                                });
                        }else{
                            reject(false)
                            this.bereit = true
                        }
                    });
                }else{
                    this.bereit = true
                }
            });
        });
    }

    btpruefen_result_anzeigen(tmp_valueArray: any = undefined){
        /**
         *  1. Paginator zeigt alle Bauteile an; 
         *  2. Zeilen mit Fehler farblich markieren; 
         *  3. Felder mit Fehler farblich markieren; 4. neues Fenster wie in Leiterplatten öffnen
        */
        
        // 2. Alle Bauteile sollen angezeigt werden
        this.bereit = true;
        this.onRadioChange({value: "slkomp"})

        // 3. Durch den Paginator, alle Bauteile anzeigen, damit Fehler Übersichtlich durchgegangen werden kann
        if(this.paginator){
            this.paginator.pageSize = this.importBauteile.data.length
        }

        this.markieren = []
        this.fehlermeldung = {}
        if(tmp_valueArray){
            for (const tmp_value of tmp_valueArray) {
                this.markieren.push(tmp_value.binr)
                if(!this.fehlermeldung[tmp_value.binr]){
                    this.fehlermeldung[tmp_value.binr] = {}
                }
                this.fehlermeldung[tmp_value.binr][tmp_value.bereich] = tmp_value.message
            }
        }

        // 4. neues Fenster für Fehlermeldungen öffnen

        // Speichere die Fehler im Service, bzw. LocalStorage, um, wenn man möchte, eine Fehlermeldungs Fenster zu öffnen. 
        // Der Knopf zum öffnen, des Fensters befindet sich im Header
        this.windows.setFehlermeldungen(tmp_valueArray, [{id:"bompos", label:"Bompos"}, {id:"message", label:"Beschreibung"}], "Import")

        // Öffne ein Material Dialog Popup (soll das Fehlermeldungs Fenster ersetzen)
        //this.windows.openFehlerMeldungenDialog(tmp_valueArray, [{id:"bompos", label:"Bompos"}, {id:"message", label:"Beschreibung"}], "Import")
    }

    uebernehmen(){
        if(this.importBauteile.data.length == 0){
            //this.mitteilungService.createMessage("Keine Importzeilen zur Übernahme vorhanden", "warning")
            this.mitteilungService.createMessageDialog("Keine Importzeilen zur Übernahme vorhanden")
            return
        }
        
        // Benutzer Fragen, ob es wirklich ausgeführt werden soll
        const dialogRefUebernahmeBeginnen = this.dialog.open(DialogComponent, {
            width: "400px"
            ,data: {
                titel: "Import Tabelle übernehmen",
                content: "Wollen Sie wirklich die Tabelle übernehmen?",
                ja_button_content: "Übernehmen",
                ja_button_style: "success",
                nein_button_exist_not: true
            }
        });
        
        // Dialogfenster Öffnen ---------------------------------------------------------------------
        let subscription1 = dialogRefUebernahmeBeginnen.afterClosed().pipe(
            filter((result: any) => result != undefined),   // Abbrechen
            tap((result: any) => {                          // ja: true; nein: false;
                subscription1.unsubscribe();

                this.weiter_clicked = true;

                if(this.form_baugruppename.valid){
        // -------------------- Baugruppe schon vorhanden? ----------------------------------------------------------------------------
                    UtilBaugruppe.pruefeBgnrkd(this.backend, this.form_baugruppename.get("baugruppenname")?.value ?? null).then((value: boolean) => {
                        if(value){
        // -------------------- Wenn ja, Fehlermeldung ausgeben ------------------------------------------------------------------------
                            this.form_baugruppename.get("baugruppenname")?.setErrors({ "bgnrkd_existiert": true });
                            this.mitteilungService.createMessageDialog(this.fehlermeldung_baugruppenname.bgnrkd_existiert)
                            this.weiter_clicked = false;
                        }else{
        // -------------------- Ansonsten, ohne Fragen, Baugruppe erstellen und Daten einfügen ------------------------------------------
                            this.uebernehmen_vorbereiten(this.form_baugruppename.get("baugruppenname")?.value);
                        }      
                    }, (error)=>{
                        console.error(error)
                        this.weiter_clicked = false;
                    });
                }
            })
        ).subscribe();
    }

    uebernehmen_vorbereiten(bgnrkd: any){
        this.bitte_warten_uebernehmen = true;

        let bauteiloptionkd: string | number | null = localStorage.getItem("bauteiloptionkd");
        bauteiloptionkd = parseInt(bauteiloptionkd ?? "0");

        // ---------------------------- Prüfdaten auf 0 setzen. --------------------------------------------------------
        let subscriptionAlleBIPruefdatenloeschen = this.backend
        .AlleBIPruefdatenloeschen()
        .subscribe((value:any) => {
            subscriptionAlleBIPruefdatenloeschen.unsubscribe();
            if (value !== false) {
        // ------------------------------------- 1. Bauteil prüfen ------------------------------------------------------
                let subscription1 = this.backend
                    .AlleImportBauteilePruefen()
                    .subscribe((value:any) => {
                        subscription1.unsubscribe();

                        let bt_pruefen_success = value[0]
                        let bt_pruefen_result = value[1]

                        if( bt_pruefen_success === true ){
        // ------------------------------------------------- 2. Stückliste/BOM prüfen ---------------------------------------
                            let subscription2 = this.backend
                                .AlleImportStuecklistenPruefen()
                                .subscribe((value:any) => {
                                    subscription2.unsubscribe();
                                    if(value !== true && value !== false){
        // ------------------------------------------------------------- 3. Stückliste/BOM komprimieren ---------------------------------------
                                        let subscription3 = this.backend
                                            .ImportStuecklisteKomprimieren()
                                            .subscribe((value:any) => {
                                                subscription3.unsubscribe();
                                                if (value !== false) {
        // ----------------------------------------------------------------------------- 4. Prüfung fertig. Daten übernehmen ---------------------------------------
                                                let subscription4 = this.backend
                                                    .ImportUebernehmen(bgnrkd, bauteiloptionkd)
                                                    .subscribe((value:any) => {
                                                        subscription4.unsubscribe();

                                                        if (value !== false) {
                                                            if(this.neues_projekt){
                                                                localStorage.setItem('baugruppenname', this.form_baugruppename.get("baugruppenname")?.value ?? "");
                                                                this.router.navigate(UtilUrl.neuesProjekt.leiterplatte(value))
                                                            }else{
                                                                this.router.navigate(UtilUrl.baugruppen.baugruppen)
                                                            }
                                                        }

                                                    }); // 4. Prüfung fertig. Daten übernehmen --- Ende
                                            }
                                        }); // 3. Stückliste/BOM komprimieren --- Ende
                                    }else if (value !== false) {
        // ------------------------------------------------------------- 3. Stückliste/BOM komprimieren ---------------------------------------
                                        let subscription3 = this.backend
                                            .ImportStuecklisteKomprimieren()
                                            .subscribe((value:any) => {
                                                subscription3.unsubscribe();
                                                if (value !== false) {
        // ----------------------------------------------------------------------------- 4. Prüfung fertig. Daten übernehmen ---------------------------------------
                                                    let subscription4 = this.backend
                                                        .ImportUebernehmen(bgnrkd, bauteiloptionkd)
                                                        .subscribe((value:any) => {
                                                            subscription4.unsubscribe();
                                                        }); // 4. Prüfung fertig. Daten übernehmen --- Ende
                                                }
                                            }); // 3. Stückliste/BOM komprimieren --- Ende
                                    }
                                }); // 2. Stückliste/BOM prüfen --- Ende
                        }else{
                            let subscriptionGetImport = this.backend.ImportBauteilAnzeigen().subscribe((value) => {
                                subscriptionGetImport.unsubscribe();
                                if (value !== false) {
                                    this.importBauteile = new MatTableDataSource(value);
                                    this.importBauteile.data.length = value.length;
                    
                                    let komprimierteValue = value.filter((tmp_value: any) => tmp_value?.komprimierung === 1);
                                    this.komprimierteImportBauteile =  new MatTableDataSource(komprimierteValue);
                    
                                    // geänderte Zeilen markieren; fehlende Felder markieren; Neues Fenster öffnen; 
                                    this.btpruefen_result_anzeigen(bt_pruefen_result)

                                    this.bitte_warten_uebernehmen = false;
                                }
                            });
                        }
                    }); // 1. Bauteil prüfen --- Ende
            }
        }); //  Prüfdaten auf 0 setzen. --- Ende
    }
    //#endregion
    //#region Hochladen
    excel_hochladen(file: any, arbeitsblatt?: any, kopfzeile?: any, datenbereich?: any, spalten?: any){
        this.bereit = false;
        this.bitte_warten_excel_hochladen = true;
        
        this.promise_tabelle_loeschen(false).then((value) => {
            if (value!== false) {
                let subscription = this.backend
                    .ImportStueckliste(file, this.form_baugruppename.get("baugruppenname")?.value, arbeitsblatt, kopfzeile, datenbereich, spalten)
                    .subscribe((value:any) => {
                        subscription.unsubscribe();
                        if (value !== false) {
                            this.alles_pruefen(false).finally(()=>{
                                this.bereit = true;
                                this.bitte_warten_excel_hochladen = false;
                            })
                        }
                    });
            }else{
                this.bereit = true;
                this.bitte_warten_excel_hochladen = false;
            }
        });
    }

    import_konfiguration(event: any){ 
        const datei = event;

        // Mime Type Prüfung finden zum einen hier und im Backend (PHP) statt, weil die Fehlermeldungen vom Backend zum Frontend noch richtig eingerichet werden müssen 
        let file_name_array = datei.name.split(".")
        let file_extension = file_name_array[file_name_array.length -1] 

        if(file_extension){
            file_extension = file_extension.toLowerCase();
        }

        if(file_extension != "xlsx" && file_extension != "csv" && file_extension != "xls"){
            //this.mitteilungService.createMessage("Der Import akzeptiert nur xls, xlsx und csv!", "warning")
            this.mitteilungService.createMessageDialog("Der Import akzeptiert nur xls, xlsx und csv!")
            return
        }

        this.nicht_tabelle_loeschen = true;
        if(this.neues_projekt){
            this.router.navigate(UtilUrl.neuesProjekt.import_konfiguration, { state: {datei: datei} });
        }else{
            this.router.navigate(UtilUrl.import.konfiguration, { state: {datei: datei} });
        }
    }
    //#endregion
    //#region filter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.importBauteile.filter = filterValue.trim().toLowerCase();
    }
    //#endregion
    //#region selection
    /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
    isAllSelected() {
        return UtilFormular.isAllSelected(this.selection, this.importBauteile.data.length); 
    }

    /** Alle Zeilen auswaehlen oder abwaehlen */
    toggleAllRows() {
        UtilFormular.toggleAllRows(this.selection, this.importBauteile.data.length, this.importBauteile);
    }
    //#endregion
    //#region sonstiges
    lieferant_change(event: any, element:any){
        // finde die ausgewählte Baugruppe durch bgnrkd
        if(!this.linamekd){
            return
        }
        if(!event.target || !event.target.value){
            return
        }
        let ausgewaehlteLieferant: any = this.linamekd.findIndex(x => x.LINR == event.target.value);
        
        // ändere die zu verändernden Auftrag mit dem ausgewählten Baugruppe
        element.linr = this.linamekd[ausgewaehlteLieferant]['LINR'];
        element.linamekd = this.linamekd[ausgewaehlteLieferant].Lieferantenname
    }

    onRadioChange(event: any) {
        this.ansicht = event.value; 
        if(event.value == "bt"){
            this.komprimiert = false;
            this.selectedColoums = [...this.bt_columnsToDisplay, 'expand'];
            this.selectedBauteile = this.importBauteile;
        }else if(event.value == "slkomp"){
            this.komprimiert = true;
            this.selectedColoums = [...this.sl_komprimiertecolumnsToDisplay, 'expand'];
            this.selectedBauteile = this.komprimierteImportBauteile;
        }else if(event.value == "sl"){
            this.komprimiert = false;
            this.selectedColoums = [...this.sl_columnsToDisplay, 'expand'];
            this.selectedBauteile = this.importBauteile;
        }

        this.selectedBauteile.sort = this.sort; 

        if(this.paginator){
            this.paginator.pageIndex = 0;
        }
        this.selectedBauteile.paginator = this.paginator;

        this.filterAll          = ""
    }

    onBaugruppennameChange(event: Event): void {
        const inputElement = event.target as HTMLInputElement;

        localStorage.setItem('baugruppenname', this.form_baugruppename.get("baugruppenname")?.value ?? "");
    }

    zurueck(){
        this.router.navigate(UtilUrl.neuesProjekt.neues_projekt)
    }
    //#endregion
}
