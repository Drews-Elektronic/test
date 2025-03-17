import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

import { DataTransferService } from 'src/app/services/data-transfer.service';
import { getTrigger } from 'src/app/services/table.service'
import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { Baugruppe } from 'src/app/interfaces/baugruppe';

import { DialogComponent } from '../../.children/dialog/dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { UtilFormular } from 'src/app/utils/util.formular';
import { UtilDialog } from 'src/app/utils/util.dialog';
import { UtilUrl } from 'src/app/utils/util.url';

export interface AngepassteBaugruppe { // Angular Material Table kann nur Arrays erkennen, die keine verschachtelte Objekte besitzt. 
    bgnrkd: string;
    slpositionen: string;
    bgbezeichnungkd: string;
    letzteaenderungzpkt: string;
    statuslp: string;
    statussl: string;
}

@Component({
    selector: 'mpl-baugruppen',
    templateUrl: './baugruppen.component.html',
    styleUrls: ['./baugruppen.component.scss'],
    animations: getTrigger
})
export class BaugruppenComponent implements OnInit {
    filterAll:          string = ""
    
    columnsToDisplay = ['select', 'bgnrkd', 'bgbezeichnungkd', 'slpositionen', 'anlagezeitpunkt', 'letzteaenderungzpkt', 'statuslp', 'statussl', "bgbemerkungkd", "loeschen"];
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    expandedElement: AngepassteBaugruppe | null | undefined;

    baugruppen: MatTableDataSource<any> = new MatTableDataSource(); // muss nicht angepasst werden
    baugruppenLength: number = 0;

    selection: any = new SelectionModel<any>(true, []);

    @ViewChild(MatPaginator) paginator: MatPaginator | any;

    // In Zukünft soll es durch eine Datenbank abfrage geklärt werden
    statuslp: any = [
        {
            value:  "1",
            name:   "Noch nicht angelegt",
            selected: true
        },
        {
            value:  "2",
            name:   "In Bearbeitung"
        },
        {
            value:  "3",
            name:   "Vollständig"
        },
        {
            value:  "4",
            name:   "In Prüfung"
        },
        {
            value:  "5",
            name:   "Geprüft und OK"
        },
    ]

    // In Zukünft soll es durch eine Datenbank abfrage geklärt werden
    statussl: any = [
        {
            value:  "1",
            name:   "Noch nicht angelegt",
            selected: true
        },
        {
            value:  "2",
            name:   "In Bearbeitung"
        },
        {
            value:  "3",
            name:   "In Prüfung"
        },
        {
            value:  "4",
            name:   "Geprüft"
        },
        {
            value:  "5",
            name:   "Vollständig"
        }
    ]

    kundenbauteile: any[] = [];

    bereit:boolean = false;
    bitte_warten_speichern: boolean = false;

    constructor(
        private backend: BackendService,
        private dataTransfer: DataTransferService,
        private router: Router,
        private mitteilungService: MitteilungService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.GetBaugruppen();
        this.GetFormFields();
        this.GetKundenStueckliste();
    }

    ngOnDestroy(): void {
        this.mitteilungService.closeMessage();
    }

    //#region Get
    GetBaugruppen(bgnr: number | string | undefined = undefined) {
        if(!bgnr){
            this.bereit = false;
        }
        let subscription = this.backend.GetBaugruppen(bgnr).subscribe((value) => {
            subscription.unsubscribe();
            this.bereit = true;
            if (value !== false) {
                if(bgnr){
                    const find_auftrag = this.baugruppen.data.findIndex((value:any)=>value.bgnr == bgnr);
                    if(find_auftrag > -1){
                        this.baugruppen.data[find_auftrag] = value[0];
                    }
                }else{
                    this.baugruppen = new MatTableDataSource(value);
                    this.baugruppenLength = value.length;
                }

                this.baugruppen._updateChangeSubscription();

                this.baugruppen.paginator = this.paginator;
            }
        });
    }

    GetFormFields(){
        let subscription = this.backend.GetFormFields("MPLBauteilPoolZeile").subscribe((value) => {
            subscription.unsubscribe();
            if (value !== false) {
                /*console.log("value")
                console.log(value)

                // Muss noch umgeändert werden
                this.statuslp = value.statuslp
                this.statussl = value.statuss1
                */
            }
        });
    }

    GetKundenStueckliste(){
        let subscription = this.backend.GetKundenStueckliste().subscribe((value) => {
            subscription.unsubscribe();
            if (value !== false) {
                this.kundenbauteile = value;
            }
        });
    }

    GetFilteredKundenBauteile(bgnr: any){
        return this.kundenbauteile.filter(element => element.bgnr === bgnr);
    }
    //#endregion
    //#region Update, Delete
    Update(baugruppe: any) {
        this.bitte_warten_speichern = true;

        let subscription = this.backend
            .UpdateBaugruppe(baugruppe)
            .subscribe((value) => {
                subscription.unsubscribe();
                if (value !== false) {
                    this.GetBaugruppen(baugruppe.bgnr);
                    //this.mitteilungService.createMessage("Baugruppe wurde erfolgreich aktualisiert", "success")
                }

                this.bitte_warten_speichern = false;
            });
    }

    loeschen(
        event: Event | null,
        baugruppe: any = null
    ) {
        if(event){
            event.stopPropagation()
        }

        let length: number
        let baugruppen_name: string
        if(baugruppe){
            length = 1
            baugruppen_name = baugruppe?.bgnrkd
        }else{
            length = this.selection.selected.length
            baugruppen_name = this.selection.selected[0].bgnrkd
        }

        let titel: string;
        let content: string;
        if(length > 1){
            titel = length + " Baugruppen Löschen";
            content = "Wollen Sie wirklich " + length + " Baugruppen unwiderruflich löschen?"
        }else{
            titel = "Baugruppe '" + baugruppen_name + "' Löschen";
            content = "Wollen Sie wirklich das Bauteil unwiderruflich löschen?"
        }

        UtilDialog.loeschenBestaetigen(
            this.dialog
            ,titel
            ,content
        ).then(()=>{
            if(baugruppe === null){
                UtilFormular.loopAngularMaterialTableSelection(
                    this.selection
                    , (element: any, resolve: any, reject: any)=>{
                        let subscription = this.backend
                            .DeleteBaugruppe(element)
                            .subscribe((value) => {
                                subscription.unsubscribe();
                                if (value !== false) {
                                    UtilFormular.loescheZeileDurchObject(this.baugruppen, element);
                                    //this.mitteilungService.createMessage("Baugruppe wurde erfolgreich gelöscht", "success")
                                }
                                resolve(true);
                            },(error)=>{
                                console.error(error)
                                reject(error)
                            });
                    }
                ).then(()=>{
                    this.selection.clear()
                })
            }else{
                let subscription = this.backend
                    .DeleteBaugruppe(baugruppe)
                    .subscribe((value) => {
                        subscription.unsubscribe();
                        if (value !== false) {
                            UtilFormular.loescheZeileDurchObject(this.baugruppen, baugruppe);
                            //this.mitteilungService.createMessage("Baugruppe wurde erfolgreich gelöscht", "success")
                        }
                    });
            }
        })
    }
    //#endregion
    //#region Umleiten
    Umleiten_nach_Leiterplattendaten(baugruppennummer: number): void {
        this.router.navigate(UtilUrl.baugruppen.leiterplatte(baugruppennummer))
    }
    Umleiten_nach_Stueckliste(baugruppennummer: number): void {
        this.router.navigate(UtilUrl.baugruppen.bom(baugruppennummer))
    }
    Umleiten_nach_Baugruppe_Auftrag_anlegen(baugruppennummer: number){
        this.router.navigate(UtilUrl.neuesAngebot.neues_angebot(baugruppennummer))
    }
    //#endregion
    //#region Sonstiges
    konvertStatus(status:string|undefined){
        if(!status) {
            return undefined
        }
        for(let x of this.statuslp){
            if(x.value == status){
                return x.name
            }
        }
        return undefined
    }
    //#endregion
    //#region Filter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.baugruppen.filter = filterValue.trim().toLowerCase();
    }
    //#endregion
    //#region selection
    /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
    isAllSelected() {
        return UtilFormular.isAllSelected(this.selection, this.baugruppenLength); 
    }

    /** Alle Zeilen auswaehlen oder abwaehlen */
    toggleAllRows() {
        UtilFormular.toggleAllRows(this.selection, this.baugruppenLength, this.baugruppen);
    }
    //#endregion
}
