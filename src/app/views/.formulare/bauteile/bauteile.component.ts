import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { Bauteil } from 'src/app/interfaces/bauteil';
import { Baugruppe } from 'src/app/interfaces/baugruppe';

import { BackendService } from 'src/app/services/backend.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';
import { getTrigger } from 'src/app/services/table.service'

import { SelectionModel } from '@angular/cdk/collections';
import { UtilDialog } from 'src/app/utils/util.dialog';
import { UtilFormular } from 'src/app/utils/util.formular';
import { Beistellung } from 'src/app/enum/beistellung';
import { Router } from '@angular/router';
import { MatChipListbox } from '@angular/material/chips';

export interface AngepassterBauteil { // Angular Material Table kann keine verschachtelten Objekte erkennen.  
    bezeichnung: string;
    beschreibung: string;
    mpn: string;
    hersteller: string;
}

@Component({
    selector: 'mpl-bauteile',
    templateUrl: './bauteile.component.html',
    styleUrls: ['./bauteile.component.scss'],
    animations: getTrigger
})
export class BauteileComponent implements OnInit {
    filterAll: string = "";

    columnsToDisplay = ['select', 'filter', 'btnrkd', 'btbeschreibungkd', 'htnrkd', 'htnhkd', "agbskd", "technDaten", 'btbemerkungkd', 'loeschen'];
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    expandedElement: AngepassterBauteil | null | undefined;

    originale_bauteile: MatTableDataSource<any> = new MatTableDataSource();
    gefilterte_bauteile: MatTableDataSource<any> = new MatTableDataSource();

    @ViewChild(MatPaginator) paginator: MatPaginator | any;

    baugruppen: Baugruppe[] = []
    ausgewaehlte_baugruppen: any
    baugruppennummer!: number;

    @ViewChild(MatChipListbox) chipListbox!: MatChipListbox;

    aglakd: any[] = []
    aghakd: any[] = []
    agbskd: any[] = []
    agbtkd: any[] = []

    linamekd: any[] = []

    bereit: boolean = false;
    bitte_warten_speichern: boolean = false;

    loeschen_selection: any = new SelectionModel<any>(true, []);
    baugruppen_selection: any = new SelectionModel<any>(true, []);

    Beistellung = Beistellung

    constructor(
        private backend: BackendService, 
        private mitteilungService: MitteilungService,
        private elementRef: ElementRef,
        private dialog: MatDialog,
        private route: Router
    ) {}

    ngOnInit(): void {
        Promise.all([
            this.Get()
            , this.GetBaugruppen()
        ]).then((value)=>{
                        this.bereit = true;
        })
        
        this.GetFormFields();
        this.GetLieferanten();
    }

    ngOnDestroy(): void {
        this.mitteilungService.closeMessage();
    }

    //#region GET
    Get() {
        this.bereit = false;

        return new Promise((resolve, reject)=>{
            let subscription = this.backend.GetBauteile().subscribe((value) => {
                subscription.unsubscribe();
    
                if (value !== false) {
                    this.originale_bauteile = new MatTableDataSource(value);
                    this.gefilterte_bauteile = new MatTableDataSource(value);

                    this.gefilterte_bauteile.paginator = this.paginator;
                }

                resolve(value);
            },(error)=>{
                console.error(error)
                reject(error);
            });
        })
    }

    GetBaugruppen() {
        this.bereit = false;

        return new Promise((resolve, reject)=>{
            let subscription = this.backend.GetBaugruppen().subscribe((value) => {
                subscription.unsubscribe();
                if (value !== false) {
                    this.baugruppen = value;
                }

                resolve(value);
            },(error)=>{
                console.error(error)
                reject(error);
            });
        })
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
                this.agbtkd = value.agbt
                this.agbskd = value.agbs
                this.aghakd = value.agha
                this.aglakd = value.agla
            }
        });
    }
    //#endregion
    //#region Add, Update, Delete
    AddToStueckliste(bauteil: Bauteil) {
        let subscription = this.backend
            .AddStuecklistenzeile(
                {
                    id: 0,
                    position: 0,
                    bauteil: bauteil,
                    anzahl: 1,
                    elektrischeBezeichnung: '',
                    agbskd: Beistellung.BESCHAFFUNG,
                },
                this.baugruppennummer
            )
            .subscribe((value) => {
                if (value !== false) {
                    subscription.unsubscribe();
                    //this.mitteilungService.createMessage("Bauteil wurde erfolgreich zur St\u00FCckliste hinzugef\u00FCgt", "success")
                }
            });
    }
    
    Update(bauteil: any) {
        this.bitte_warten_speichern = true;

        let subscription = this.backend
            .UpdateBauteil(bauteil)
            .subscribe((value) => {
                subscription.unsubscribe();

                this.bitte_warten_speichern = false;
            });
    }
    
    loeschen(event: Event | null, bauteil: any = null) {
        if(event){
            event.stopPropagation()
        }

        let length: number
        let bauteil_name: string
        if(bauteil){
            length = 1
            bauteil_name = bauteil?.btnrkd
        }else{
            length = this.loeschen_selection.selected.length
            bauteil_name = this.loeschen_selection.selected[0].btnrkd
        }

        let titel: string;
        let content: string;
        if(length > 1){
            titel = length + " Bauteile Löschen";
            content = "Wollen Sie wirklich " + length + " Bauteile unwiderruflich löschen?"
        }else{
            titel = "Bauteil '" + bauteil_name + "' Löschen";
            content = "Wollen Sie wirklich das Bauteil unwiderruflich löschen?"
        }

        UtilDialog.loeschenBestaetigen(
            this.dialog
            ,titel
            ,content
        ).then(()=>{
            if(bauteil === null){
                UtilFormular.loopAngularMaterialTableSelection(
                    this.loeschen_selection
                    , (element: any, resolve: any, reject: any)=>{
                        let subscription2 = this.backend
                            .DeleteBauteil(element)
                            .subscribe((value) => {
                                subscription2.unsubscribe();

                                if (value !== false) {
                                    UtilFormular.loescheZeileDurchID(this.originale_bauteile, "btnr", element["btnr"]);
                                    UtilFormular.loescheZeileDurchID(this.gefilterte_bauteile, "btnr", element["btnr"]);
                                
                                    this.originale_bauteile._updateChangeSubscription()
                                    this.gefilterte_bauteile._updateChangeSubscription()
                                }

                                resolve(true);
                            });
                    }
                ).then(()=>{
                    this.loeschen_selection.clear();
                })
            }else{
                let subscription2 = this.backend
                    .DeleteBauteil(bauteil)
                    .subscribe((value) => {
                        subscription2.unsubscribe();
                        if (value !== false) {
                            UtilFormular.loescheZeileDurchID(this.originale_bauteile, "btnr", bauteil["btnr"]);
                            UtilFormular.loescheZeileDurchID(this.gefilterte_bauteile, "btnr", bauteil["btnr"]);

                            this.originale_bauteile._updateChangeSubscription()
                            this.gefilterte_bauteile._updateChangeSubscription()
                        }
                    });
            }
            
        })
    }
    //#endregion
    //#region Filter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.gefilterte_bauteile.filter = filterValue.trim().toLowerCase();
    }

    applyBaugruppenFilter(){
        const baugruppen_filtern = this.baugruppen_selection.selected
            
        if(baugruppen_filtern.length > 0){
            const data = this.originale_bauteile.data
            let gefiltert_data;

            gefiltert_data = data.filter((bauteil: any)=>{
                if(bauteil.bauteil_in_bom){
                    return baugruppen_filtern.some((filter: any)=>
                        bauteil.bauteil_in_bom.some((baugruppe: any)=>
                            baugruppe.bgnr === filter.bgnr
                        )
                    )
                }
    
                return false
            })

            this.gefilterte_bauteile.data = gefiltert_data
            this.gefilterte_bauteile._updateChangeSubscription() 
        }else{
            this.deleteBaugruppenFilter();
        }
    }

    deleteBaugruppenFilter(){
        this.baugruppen_selection.clear();

        this.gefilterte_bauteile.data = this.originale_bauteile.data
        this.gefilterte_bauteile._updateChangeSubscription() 
    }
    //#endregion
    //#region selection
    /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
    isAllSelected() {
        return UtilFormular.isAllSelected(this.loeschen_selection, this.originale_bauteile.data.length); 
    }

    /** Alle Zeilen auswaehlen oder abwaehlen */
    toggleAllRows() {
        UtilFormular.toggleAllRows(this.loeschen_selection, this.originale_bauteile.data.length, this.originale_bauteile);
    }

    toggleFilterSelection(event: any, baugruppe: any){
        if(event){
            this.baugruppen_selection.toggle(baugruppe)
        }

        this.applyBaugruppenFilter();
    }
    //#endregion
    //#region Sonstiges
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
    //#endregion
    //#region InEntwicklung
    scrollToElement(): void {
        const panelId = `test_1`;
        const panelElement = this.elementRef.nativeElement.querySelector(`[ng-reflect-id="${panelId}"]`);
        if (panelElement) {
            panelElement.scrollIntoView({ behavior: 'smooth' });
            panelElement.classList.remove('show');
        }
    }
    //#endregion
    //#region Umleitung
    UmleitenNachBom(event: any): void {
        const bgnr = event.target?.value

        if(bgnr){
            const url = this.route.serializeUrl(
                this.route.createUrlTree(["baugruppen", bgnr, "bom"],)
            );

            window.open(url, '_blank');
        }
    }
    //#endregion
}
