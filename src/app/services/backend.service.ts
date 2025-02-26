import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { Angebot, Price } from '../interfaces/angebot';
import { APIError } from '../interfaces/apierror';
import { Auftrag } from '../interfaces/auftrag';
import { Baugruppe } from '../interfaces/baugruppe';
import { Leiterplatte } from '../interfaces/leiterplatte';
import { Kunde } from '../interfaces/kunde';
import { Bauteil, ComboboxenData } from '../interfaces/bauteil';
import { Stuecklistenzeile } from '../interfaces/stuecklistenzeile';

import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilDownload } from '../utils/util.download';
import { BauteilOptionStatus } from '../enum/bauteilOptionenStatus';

// Der Authentifikations Token wird durch den interceptor aus der Datei "/services/auth-interceptor.ts" in alle Request eingefügt.
// In "app.module.ts" wird der interceptior in Angular eingefügt.

@Injectable({
    providedIn: 'root',
})

export class BackendService {
    
    private url: string = environment.protocol + environment.apiUrl; 

    //public kundennummer: string | number = localStorage.getItem("kdnr") ?? "Bitte Warten"; ; //! Kundennummer zum Testen | Login ist noch nicht eingebaut
    public kundennummer: string | number = localStorage.getItem("kdnr") ?? 250001; //! Kundennummer zum Testen | Login ist noch nicht eingebaut
    
    private SuccessMitteilungErstellen(value:any, sonstiges: any = undefined){
        let notification
        if(sonstiges){
            notification = sonstiges + ": " + value?.message?.notification
        }else{
            notification = value?.message?.notification
        }
        
        if(notification != "" && notification != null && notification != undefined){
            //this.mitteilungService.createMessageDialog(notification, "Erfolgreich!")
            this.mitteilungService.createMessage(notification , "success")
        }
    }

    constructor(
        private http: HttpClient,
        private mitteilungService: MitteilungService
    ) {}

    // Error Handling folgt keinem Standard und sollte auch nicht zum lernen benutzt werden

    //#region Import
    ImportBauteilAnzeigen(){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                let tmp_value :any = value.result
                
                for(let x of tmp_value){
                    x.agbskd = x.agbskd + ''
                    x.agbtkd = x.agbtkd + ''
                    x.agstkd = x.agstkd + ''
                    x.aglakd = x.aglakd + ''
                    x.aghakd = x.aghakd + ''
                }
                return tmp_value;
            })
        );
    }

    ImportBauteilAnlegen(bauteilImport: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:anlegen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('btnrkd',           bauteilImport.btnrkd            as unknown as string ?? "" );
        form.append('btbeschreibungkd', bauteilImport.btbeschreibungkd  as unknown as string ?? "" );
        form.append('htnrkd',           bauteilImport.htnrkd            as unknown as string ?? "" );
        form.append('htnhkd',           bauteilImport.htnhkd            as unknown as string ?? "" );
        form.append('linamekd',         bauteilImport.linamekd          as unknown as string ?? "" );
        form.append('btnrlikd',         bauteilImport.btnrlikd          as unknown as string ?? "" );
        form.append('btbemerkungkd',    bauteilImport.btbemerkungkd     as unknown as string ?? "" );
        form.append('slbemerkungkd',    bauteilImport.slbemerkungkd     as unknown as string ?? "" );
        form.append('bgnrkd',           bauteilImport.bgnrkd            as unknown as string ?? "" );
        form.append('bompos',           bauteilImport.bompos            as unknown as string ?? "" );
        form.append('anzprobg',         bauteilImport.anzprobg          as unknown as string ?? "" );
        form.append('anzprobgkomp',     bauteilImport.anzprobgkomp      as unknown as string ?? "" );
        form.append('elbez',            bauteilImport.elbez             as unknown as string ?? "" );
        form.append('elbezkomp',        bauteilImport.elbezkomp         as unknown as string ?? "" );
        form.append("agbtkd",           bauteilImport.agbtkd            as unknown as string ?? "" );
        form.append("agstkd",           bauteilImport.agstkd            as unknown as string ?? "" );
        form.append("agbskd",           bauteilImport.agbskd            as unknown as string ?? "" );
        form.append("aghakd",           bauteilImport.aghakd            as unknown as string ?? "" );
        form.append("aglakd",           bauteilImport.aglakd            as unknown as string ?? "" );

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    ImportBauteilUpdate(importBauteil: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:aktualisieren');
        form.append('kdnr', this.kundennummer as unknown as string);

        form.append('binr', importBauteil.binr as unknown as string);
        form.append('btnrkd', importBauteil.btnrkd as unknown as string);
        form.append('btbeschreibungkd', importBauteil.btbeschreibungkd as unknown as string);
        form.append('htnrkd', importBauteil.htnrkd as unknown as string);
        form.append('htnhkd', importBauteil.htnhkd as unknown as string);
        form.append('linamekd', importBauteil.linamekd as unknown as string);
        form.append('btnrlikd', importBauteil.btnrlikd as unknown as string);
        form.append('btbemerkungkd', importBauteil.btbemerkungkd as unknown as string);
        form.append('slbemerkungkd', importBauteil.slbemerkungkd as unknown as string ?? "" );
        form.append('bgnrkd', importBauteil.bgnrkd as unknown as string);
        form.append('bompos', importBauteil.bompos as unknown as string);
        form.append('anzprobg', importBauteil.anzprobg as unknown as string);
        form.append('anzprobgkomp', importBauteil.anzprobgkomp as unknown as string);
        form.append('elbez', importBauteil.elbez as unknown as string);
        form.append('elbezkomp', importBauteil.elbezkomp as unknown as string);
        form.append('agbtkd', importBauteil.agbtkd as unknown as string);
        form.append('agstkd', importBauteil.agstkd as unknown as string);
        form.append('agbskd', importBauteil.agbskd as unknown as string);
        form.append('aghakd', importBauteil.aghakd as unknown as string);
        form.append('aglakd', importBauteil.aglakd as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    ImportBauteilDelete(BINR: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);

        form.append('binr', BINR as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }
    
    ImportBauteileTabelleLoeschen(meldung: boolean = true){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:tabelleloeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                if(meldung){
                    // this.SuccessMitteilungErstellen(value)
                }

                return value.result;
            })
        );
    }

    ImportExcelAnzeigen(file:File){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:daten');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('excel_stueckliste', file);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    ImportStueckliste(file:File, bgnrkd: any, arbeitsblatt?: any, kopfzeile?: any, datenbereich?: any, spalten?: any): Observable<object | false> 
    {
        let form: FormData = new FormData();

        form.append('viewaction', 'import:hochladen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnrkd', bgnrkd ?? "" as unknown as string);
        
        form.append('excel_stueckliste', file);

        form.append('arbeitsblatt', arbeitsblatt as unknown as string);
        form.append('datenbereich', JSON.stringify(datenbereich) as unknown as string);
        form.append('spalten', JSON.stringify(spalten) as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    AlleBIPruefdatenloeschen(){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:allebipruefdatenloeschen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    BIPruefdatenloeschen(binr: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:bipruefdatenloeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('binr', binr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    AlleImportBauteilePruefen(erfolgsMeldungAnzeigen: boolean = true){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:btpruefen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return [false, value.result];
                }

                if(erfolgsMeldungAnzeigen){
                    // this.SuccessMitteilungErstellen(value)
                }

                return [true, value.result];
            })
        );
    }
    EinImportBauteilPruefen(binr:any){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:btzeilepruefen');
        form.append('kdnr', this.kundennummer as unknown as string);

        form.append('binr', binr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return [false, value.result];
                }

                return [true, value.result];
            })
        );
    }

    AlleImportStuecklistenPruefen(erfolgsMeldungAnzeigen: boolean = true){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:slpruefen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if(value.message.code == 50708){
                    return value.message.code;
                }
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                if(erfolgsMeldungAnzeigen){
                    // this.SuccessMitteilungErstellen(value)
                }

                return value.result;
            })
        );
    }
    EinImportStuecklistePruefen(binr: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:slzeilepruefen');
        form.append('kdnr', this.kundennummer as unknown as string);

        form.append('binr', binr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    bgnrkdpruefen(bgnrkd: string){ // noch nicht fertig
        let form: FormData = new FormData();

        form.append('viewaction', 'import:bgnrkdpruefen');
        form.append('kdnr', this.kundennummer as unknown as string);

        form.append('bgnrkd', bgnrkd as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    ImportStuecklisteKomprimieren(successMeldung:boolean = true){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:slkomprimieren');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                if(successMeldung){
                    // this.SuccessMitteilungErstellen(value)
                }

                return value.result;
            })
        );
    }

    ImportUebernehmen(bgnrkd: string, bauteiloptionkd?: BauteilOptionStatus){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:allezeilenuebernehmen');
        form.append('kdnr', this.kundennummer as unknown as string);

        form.append('bgnrkd', bgnrkd ?? "" as unknown as string);

        if(bauteiloptionkd){
            form.append('bauteiloptionkd', bauteiloptionkd as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    ImportFehlermeldungen(){
        let form: FormData = new FormData();

        form.append('viewaction', 'import:fehlermeldungen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    //#endregion
    //#region Unterlagen
    UnterlagenAnzeigen(aunr: string|null = null): Observable<object | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'unterlagen:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);

        if(aunr){
            form.append('aunr', aunr);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    UnterlageImportieren(file:File, aunr: string): Observable<object | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'unterlagen:hochladen');
        form.append('kdnr', this.kundennummer as unknown as string);
        if(aunr){
            form.append('aunr', aunr);
        }

        form.append(`file`, file);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                //// this.SuccessMitteilungErstellen(value) // Keine Datenbank Meldung vorhanden, weshalb das untere verwendet wird.
                // this.mitteilungService.createMessage("Datei wurde erfolgreich hochgeladen", "success"); // Deaktiviert, weil keine Successmeldung vorkommen soll
                
                return value.result;
            })
        );
    }

    UnterlageLoeschen(dateiname: string, aunr:any = null): Observable<object | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'unterlagen:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        if(aunr){
            form.append('aunr', aunr);
        }

        form.append(`dateiname`, dateiname);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                //// this.SuccessMitteilungErstellen(value) // Keine Datenbank Meldung vorhanden
                // this.mitteilungService.createMessage("Datei wurde erfolgreich gelöscht", "success"); 

                return value.result;
            })
        );
    }

    UnterlageDownloaden(unterlage: any, aunr:string | number) {
        let form: FormData = new FormData();

        form.append('viewaction', 'unterlagen:download');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('aunr', aunr as unknown as string);

        form.append(`dateiname`, unterlage.name as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                console.log("value")
                console.log(value)

                const filename  = value.result.filename
                const content   = value.result.content
                const mime_type = value.result.mime_type

                UtilDownload.saveFileFromBlob(filename, content, mime_type)

                //// this.SuccessMitteilungErstellen(value) // Keine Datenbank Meldung vorhanden
                // this.mitteilungService.createMessage("Datei wurde erfolgreich gelöscht", "success"); 

                return value.result;
            })
        );
    }
    //#endregion
    //#region Bauteil
    GetBauteile(): Observable<Bauteil[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bauteile:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    AddBauteil(bauteil: Bauteil): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bauteile:anlegen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('btnrkd', bauteil.btnrkd);
        form.append('btbeschreibungkd', bauteil.btbeschreibungkd);
        form.append('htnrkd', bauteil.htnrkd); // mpn
        form.append('htnhkd', bauteil.htnhkd);
        form.append('btnrlikd', bauteil.btnrlikd);
        form.append('linamekd', bauteil.linamekd);
        form.append('btbemerkungkd', bauteil.btbemerkungkd as string);

        form.append('aglakd', bauteil.aglakd as string);
        form.append('aghakd', bauteil.aghakd as string);
        form.append('agbskd', bauteil.agbskd as string);
        form.append('agbtkd', bauteil.agbtkd as string);
        form.append('agstkd', bauteil.agstkd as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    UpdateBauteil(bauteil: Bauteil): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bauteile:aktualisieren');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bpknr', bauteil.bpknr as unknown as string);
        form.append('btnrkd', bauteil.btnrkd);
        form.append('btbeschreibungkd', bauteil.btbeschreibungkd);
        form.append('htnrkd', bauteil.htnrkd); // mpn
        form.append('htnhkd', bauteil.htnhkd);
        form.append('btnrlikd', bauteil.btnrlikd);
        form.append('linamekd', bauteil.linamekd);
        form.append('btbemerkungkd', bauteil.btbemerkungkd as string);

        form.append('aglakd', bauteil.aglakd as string);
        form.append('aghakd', bauteil.aghakd as string);
        form.append('agbskd', bauteil.agbskd as string);
        form.append('agbtkd', bauteil.agbtkd as string);
        form.append('agstkd', bauteil.agstkd as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    DeleteBauteil(bauteil: Bauteil): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bauteile:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bpknr', bauteil.bpknr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    GetComboboxenData(): Observable<ComboboxenData | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bauteile:combobox');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                /*
                let aglakd = []
                let aghakd = []
                let agbskd = []
                let agaakd = []
                
                value.result.forEach((element: any) => {
                    let tmp = {
                        name: 
                        value:
                    };


                    .push(tmp);
                });
                
                return {aglakd: aglakd, aghakd: aghakd, agbskd: agbskd, agaakd: agaakd};
                */

                // this.SuccessMitteilungErstellen(value)

                return {aglakd: [], aghakd: [], agbskd: [], agaakd: []}
            })
        );
    }

    //#endregion
    //#region alternative
    GetAlternativeBauteile(bqnr: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'alternative:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('bqnr', bqnr as unknown as string ?? 0);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    SucheMitSkuUndMpnAlternativeBauteile(bgnr: any, btnr: any, baugruppenmenge: number){
        let form: FormData = new FormData();

        form.append('viewaction', 'alternative:suchenbaugruppe');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('btnr', btnr as unknown as string);
        form.append('bgnr', bgnr as unknown as string);
        form.append('baugruppenmenge', baugruppenmenge as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    AlternativesBauteilSpeichern(bgnr: any, slnr: any, bqnr: any, baugruppenmenge: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'alternative:speichernbaugruppe');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('bgnr', bgnr as unknown as string ?? 0);
        form.append('slnr', slnr as unknown as string ?? 0);
        form.append('bqnr', bqnr as unknown as string ?? 0);
        form.append('baugruppenmenge', baugruppenmenge as unknown as string ?? 0);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage(value.message.notification, "success")

                return value.result;
            })
        );
    }

    AlternativeAngebenBaugruppe(btnr: any, bgnr: any, baugruppenmenge: any, htnr: any, btnrli: any, btbeschreibung: string, linr: any){
        let form: FormData = new FormData();

        form.append('viewaction',           'alternative:angebenbaugruppe');
        form.append('kdnr',                 this.kundennummer as unknown as string);

        form.append('btnr',                 btnr            as unknown as string);
        form.append('bgnr',                 bgnr            as unknown as string);

        if(baugruppenmenge){
            form.append('baugruppenmenge',  baugruppenmenge as unknown as string);
        }

        if(htnr){
            form.append('htnr',             htnr            as unknown as string);
        }
        if(btnrli){
            form.append('btnrli',           btnrli          as unknown as string);
        }
        if(btbeschreibung){
            form.append('btbeschreibung',   btbeschreibung  as unknown as string);
        }
        if(linr){
            form.append('linr',             linr            as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage(value.message.notification, "success")

                return value.result;
            })
        );
    }

    AusgewaehltesAlternativesBauteilLoeschen(element: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'alternative:loeschenbaugruppe');
        form.append('kdnr',       this.kundennummer as unknown as string);

        form.append('slnr',       element.slnr            as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage(value.message.notification, "success")

                return value.result;
            })
        );
    }

    AlternativeAngebenImport(btbeschreibung: any, htnr: any, btnrli: any, linr: any, baugruppenmenge: number) {
        let form: FormData = new FormData();

        form.append('viewaction',           'alternative:angebenimport');
        form.append('kdnr',                 this.kundennummer as unknown as string);

        if(baugruppenmenge){
            form.append('baugruppenmenge',  baugruppenmenge   as unknown as string);
        }

        if(htnr){
            form.append('htnr',             htnr            as unknown as string);
        }
        if(btnrli){
            form.append('btnrli',           btnrli          as unknown as string);
        }
        if(btbeschreibung){
            form.append('btbeschreibung',   btbeschreibung  as unknown as string);
        }
        if(linr){
            form.append('linr',             linr            as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage(value.message.notification, "success")

                return value.result;
            })
        );
    }

    AlternativeSpeichernImportAnlegen(bqnr: any) {
        let form: FormData = new FormData();

        form.append('viewaction', 'alternative:speichernimportanlegen');
        form.append('kdnr',       this.kundennummer as unknown as string);

        form.append('bqnr',       bqnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage(value.message.notification, "success")

                return value.result;
            })
        );
    }

    AlternativeAngebenBauteil(btnr: string | number, bgnr: string | number, baugruppenmenge: number, htnr: any, btnrli: any, btbeschreibung: any, linr: any) {
        let form: FormData = new FormData();

        form.append('viewaction',           'alternative:angebenbauteil');
        form.append('kdnr',                 this.kundennummer as unknown as string);

        if(baugruppenmenge){
            form.append('baugruppenmenge',  baugruppenmenge   as unknown as string);
        }

        if(btnr){
            form.append('htnr',             btnr            as unknown as string);
        }
        if(bgnr){
            form.append('htnr',             bgnr            as unknown as string);
        }

        if(htnr){
            form.append('htnr',             htnr            as unknown as string);
        }
        if(btnrli){
            form.append('btnrli',           btnrli          as unknown as string);
        }
        if(btbeschreibung){
            form.append('btbeschreibung',   btbeschreibung  as unknown as string);
        }
        if(linr){
            form.append('linr',             linr            as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage(value.message.notification, "success")

                return value.result;
            })
        );
    }

    AlternativeSpeichernBauteil(bqnr: any) {
        let form: FormData = new FormData();

        form.append('viewaction', 'alternative:speichernbauteil');
        form.append('kdnr',       this.kundennummer as unknown as string);

        form.append('bqnr',       bqnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage(value.message.notification, "success")

                return value.result;
            })
        );
    }
    //#endregion
    //#region Baugruppe
    GetBaugruppen(bgnr: any = undefined): Observable<any[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'baugruppen:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        if(bgnr){
            form.append('bgnr', bgnr ?? 0 as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    AddBaugruppe(baugruppe: any): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'baugruppen:anlegen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnrkd', baugruppe.bgnrkd as unknown as string);
        form.append('bgrevisionkd', baugruppe.bgrevisionkd ?? "" as unknown as string);
        form.append('bgbezeichnungkd', baugruppe.bgbezeichnungkd as unknown as string);
        form.append('statussl', baugruppe.statussl as unknown as string);
        form.append('statuslp', baugruppe.statuslp as unknown as string);
        form.append('lpbpknr', baugruppe.lpbpknr ?? "" as unknown as string);
        form.append('bgbemerkungkd', baugruppe.bgbemerkungkd as unknown as string ?? "");

        form.append('bauteiloptionkd', baugruppe.bauteiloptionkd as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.mitteilungService.createMessage("Baugruppe wurde erfolgreich angelegt", "success")

                return value.result;
            })
        );
    }
// Speichern der Baugruppenzeile
    UpdateBaugruppe(baugruppe: any): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'baugruppen:aktualisieren');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', baugruppe.bgnr as unknown as string);
        form.append('bgnrkd', baugruppe.bgnrkd as unknown as string);
        form.append('bgrevisionkd', baugruppe.bgrevisionkd as unknown as string);
        form.append('bgbezeichnungkd', baugruppe.bgbezeichnungkd as unknown as string);
        form.append('statuslp', baugruppe.statuslp as unknown as string);
        form.append('statussl', baugruppe.statussl as unknown as string);
        form.append('lpbpknr', baugruppe.lpbpknr ?? "" as unknown as string);
        form.append('bgbemerkungkd', baugruppe.bgbemerkungkd as unknown as string);

        form.append('bauteiloptionkd', baugruppe.bauteiloptionkd as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    DeleteBaugruppe(baugruppe: any): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'baugruppen:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', baugruppe.bgnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }
    //#endregion
    //#region Leiterplatte
    GetLeiterplatte(
        bgnr: string
    ): Observable<any | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', bgnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    GetLeiterplatteStandardkonfiguration(
        bgnr: string
    ): Observable<any | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:standard');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', bgnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    UpdateLeiterplatte(
        lp: any,
        successMeldung: boolean = true
    ): Observable<Leiterplatte | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:aktualisieren');
        form.append('kdnr', this.kundennummer as unknown as string);

        for(let x of Object.keys(lp)){
            form.append(x, lp[x] as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                if(successMeldung){
                    // this.SuccessMitteilungErstellen(value)
                }

                return value.result;
            })
        );
    }

    DeleteLeiterplatte(
        bgnr: number | string
    ): Observable<Leiterplatte | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', bgnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    LeiterplatteBeistellen(bgnr: any): Observable<Leiterplatte | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:beistellen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', bgnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    LeiterplatteBeistellenLoeschen(bgnr: any): Observable<Leiterplatte | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:beistellenloeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', bgnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    CheckLeiterplatte(
        leiterplatte: Leiterplatte
    ): Observable<Angebot | APIError[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'projekt:pruefen');
        form.append('bgnr', leiterplatte.id as unknown as string);
        form.append('laengeeinzel', leiterplatte.laenge as unknown as string);
        form.append('breiteeinzel', leiterplatte.breite as unknown as string);
        form.append('fraesen', leiterplatte.fraesen as unknown as string);
        form.append('lagen', leiterplatte.lagen as unknown as string);
        form.append('lptyp', leiterplatte.lptyp);
        form.append('finish', leiterplatte.finish);
        form.append(
            'kupferextern',
            leiterplatte.externeKupferDicke as unknown as string
        );
        form.append(
            'kupferintern1',
            (leiterplatte.interneKupferDicken[0] as unknown as string) ?? null
        );
        form.append(
            'kupferintern2',
            (leiterplatte.interneKupferDicken[1] as unknown as string) ?? null
        );
        form.append(
            'kupferintern3',
            (leiterplatte.interneKupferDicken[2] as unknown as string) ?? null
        );
        form.append(
            'kupferintern4',
            (leiterplatte.interneKupferDicken[3] as unknown as string) ?? null
        );
        form.append(
            'kupferintern5',
            (leiterplatte.interneKupferDicken[4] as unknown as string) ?? null
        );
        form.append(
            'kupferintern6',
            (leiterplatte.interneKupferDicken[5] as unknown as string) ?? null
        );
        form.append(
            'kupferintern7',
            (leiterplatte.interneKupferDicken[6] as unknown as string) ?? null
        );
        form.append(
            'kupferintern8',
            (leiterplatte.interneKupferDicken[7] as unknown as string) ?? null
        );
        form.append(
            'kupferintern9',
            (leiterplatte.interneKupferDicken[8] as unknown as string) ?? null
        );
        form.append(
            'kupferintern10',
            (leiterplatte.interneKupferDicken[9] as unknown as string) ?? null
        );
        form.append(
            'kupferintern11',
            (leiterplatte.interneKupferDicken[10] as unknown as string) ?? null
        );
        form.append(
            'kupferintern12',
            (leiterplatte.interneKupferDicken[11] as unknown as string) ?? null
        );
        form.append('material', leiterplatte.basismaterial);
        form.append('dicke', leiterplatte.dicke as unknown as string);
        form.append('ipcklasse', leiterplatte.ipcklasse as unknown as string);
        form.append('etest', leiterplatte.etest as unknown as string);
        form.append('pd', leiterplatte.positionsdruck);
        form.append('pdfarbe', leiterplatte.positionsdruckfarbe);
        form.append('ls', leiterplatte.loetstopplack);
        form.append('lsfarbe', leiterplatte.loetstopplackfarbe);
        form.append('ulsign', leiterplatte.ulsign);
        form.append('ulkanada', leiterplatte.ulkanada as unknown as string);
        form.append('datecode', leiterplatte.datecode);
        form.append('rohssign', leiterplatte.rohssign);
        form.append('zachsenfraesen', leiterplatte.zachsenfraesen);
        form.append(
            'zachsenfraesentiefe',
            leiterplatte.zachsenfraesentiefe as unknown as string
        );
        form.append('fasung', leiterplatte.fasung);
        form.append('senkungen', leiterplatte.senkungen);
        form.append(
            'minabstaende',
            leiterplatte.minAbstand as unknown as string
        );
        form.append(
            'minrestring',
            leiterplatte.minRestring as unknown as string
        );
        form.append('minbohrung', leiterplatte.minBohrung as unknown as string);
        form.append('lagenaufbau', leiterplatte.lagenaufbau);
        form.append('viatyp', leiterplatte.viatyp);
        form.append('viatypfuellung', leiterplatte.viafuellung);
        form.append(
            'blindvias',
            leiterplatte.anzahlBlindVias as unknown as string
        );
        form.append(
            'buriedvias',
            leiterplatte.anzahlBuriedVias as unknown as string
        );
        form.append('carbon', leiterplatte.karbondruck);
        form.append(
            'kantenverzinnung',
            leiterplatte.kantenmetallisierung as unknown as string
        );
        form.append('pressfit', leiterplatte.pressfit as unknown as string);
        form.append(
            'dkschlitze',
            leiterplatte.durchkontaktierteSchlitze as unknown as string
        );
        form.append('stiffener', leiterplatte.stiffener as unknown as string);
        form.append(
            'mintrack',
            leiterplatte.minLeiterbahn as unknown as string
        );

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    if (value.result.success) {
                        let priceList: Price[] = [];

                        value.result.prices.forEach((element: any) => {
                            let price: Price = {
                                deliverytime: element.deliverytime,
                                express: element.express == 1,
                                origin: element.origin,
                                price: element.price,
                                quantity: element.qty,
                            };

                            priceList.push(price);
                        });

                        let angebot: Angebot = {
                            id: value.result.offernumber,
                            prices: priceList,
                        };

                        return angebot;
                    } else {
                        let errorList: APIError[] = [];

                        value.result.errors.forEach((element: any) => {
                            let error: APIError = {
                                text: element.anzeige,
                                errorfields: element.errorfelder,
                            };

                            errorList.push(error);
                        });

                        return errorList;
                    }
                }
                console.log("Fehler in " + form.get('viewaction'));
                return false;
            })
        );
    }

    leiterplatteanfragen(bgnr: any, aunr: any = undefined, baugruppenmenge?:any, allestandard: boolean = false): Observable<Angebot | APIError[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:leiterplatteanfragen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', bgnr as unknown as string);
        if(aunr){
            form.append('aunr', aunr as unknown as string);
        }

        if(baugruppenmenge){
            form.append('baugruppenmenge', baugruppenmenge as unknown as string);
        }

        if(allestandard){
            form.append('allestandard', "1" as unknown as string); // "1" für true; alles andere false
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return [false, value.result];
                }

                // this.SuccessMitteilungErstellen(value)

                return [true, value.result];
            })
        );
    }

    LeiterplatteLogikFehlerAnzeigen(): Observable<Leiterplatte | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'leiterplatten:logikfehleranzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region Stueckliste
    GetStueckliste(
        bgnr: number | string,
        aunr: number | string = 0,
        slnr: number | string = 0,
    ): Observable<Object[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'stuecklisten:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', bgnr as unknown as string ?? 0);
        form.append('aunr', aunr as unknown as string ?? 0);
        form.append('slnr', slnr as unknown as string ?? 0);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }
                if(!value.result){
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    GetKundenStueckliste(): Observable<Object[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'stuecklisten:kundenstueckliste');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }
                if(!value.result){
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    AddStuecklistenzeile( // unvollständig (viewaction)
        stuecklistenzeile: Stuecklistenzeile,
        baugruppennummer: number
    ): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'stuecklisten:anlegen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', baugruppennummer as unknown as string);
        form.append('btnr', stuecklistenzeile.bauteil.btnr as unknown as string);
        form.append('bezeichnung', stuecklistenzeile.bauteil.btnrkd as unknown as string);
        form.append('beschreibung', stuecklistenzeile.bauteil.btbeschreibungkd as unknown as string);
        form.append('anzprobg', stuecklistenzeile.anzahl as unknown as string);
        form.append('elbez', stuecklistenzeile.elektrischeBezeichnung as unknown as string);
        form.append('agbskd', stuecklistenzeile.agbskd as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    UpdateStuecklistenzeile(
        stuecklistenzeile: any,
        baugruppennummer: number
    ): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'stuecklisten:aktualisieren');

        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('slnr', stuecklistenzeile.slnr as unknown as string);
        form.append('bgnr', baugruppennummer as unknown as string);

        form.append('bompos', stuecklistenzeile.bompos as unknown as string);

        form.append('agbskd', stuecklistenzeile.agbskd as unknown as string);
        form.append('agbtkd', stuecklistenzeile.agbtkd as unknown as string);
        form.append('aghakd', stuecklistenzeile.aghakd as unknown as string);
        form.append('aglakd', stuecklistenzeile.aglakd as unknown as string);

        form.append('btnrkd', stuecklistenzeile.btnrkd as unknown as string);
        form.append('btbeschreibungkd', stuecklistenzeile.btbeschreibungkd as unknown as string);
        form.append('btnrlikd', stuecklistenzeile.btnrlikd as unknown as string);
        form.append('htnhkd', stuecklistenzeile.htnhkd as unknown as string);
        form.append('htnrkd', stuecklistenzeile.htnrkd as unknown as string);
        form.append('linamekd', stuecklistenzeile.linamekd as unknown as string);
        form.append('slbemerkungkd', stuecklistenzeile.slbemerkungkd as unknown as string);

        form.append('elbezkomp', stuecklistenzeile.elbezkomp as unknown as string);
        form.append('anzprobgkomp', stuecklistenzeile.anzprobgkomp as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }
                // this.SuccessMitteilungErstellen(value)
                return value.result;
            })
        );
    }
    DeleteStuecklistenzeile(
        slnr: any,
    ): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'stuecklisten:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('slnr', slnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                // this.SuccessMitteilungErstellen(value)
                return value.result;
            })
        );
    }
    //#endregion
    //#region Auftrags Stueckliste
    GetAuftragStueckliste(
        aunr: number | string = 0,
        id: number | string = 0,
    ): Observable<Object[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftragsstueckliste:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', aunr as unknown as string ?? 0);
        form.append('slid', id as unknown as string ?? 0);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    GetAuftragStuecklisteMitBQ(
        aunr: number | string = 0,
        id: number | string = 0,
    ): Observable<Object[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftragsstueckliste:mitbqanzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', aunr as unknown as string ?? 0);
        form.append('slid', id as unknown as string ?? 0);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    DeleteAuftragStuecklistenzeile(
        id: any,
    ): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftragsstueckliste:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('slid', id as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                // this.SuccessMitteilungErstellen(value)
                return value.result;
            })
        );
    }
    DownloadAuftragsStuecklisteExcelOderPDF(
        aunr: string | number,
        excel: boolean
    ): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftragsstueckliste:export');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', aunr as unknown as string);
        form.append('excel', excel as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                const filename  = value.result.filename
                const content   = value.result.content
                const mime_type = value.result.mime_type

                UtilDownload.saveFileFromBlob(filename, content, mime_type)

                return value.result;
            })
        );
    }

    DownloadAngebot(aunr: any) {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftragsstueckliste:angebot');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', aunr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                const filename  = value.result.filename
                const content   = value.result.content
                const mime_type = value.result.mime_type

                UtilDownload.saveFileFromBlob(filename, content, mime_type)

                return value.result;
            })
        );
    }

    AngebotPdfAnzeigen(aunr: any) {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftragsstueckliste:angebot');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', aunr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                let result
                if(value?.result?.content){
                    result = UtilDownload.base64ToBlob(value.result.content)
                }

                return result;
            })
        );
    }

    GetAngebotDaten(aunr: number|string){
        let form: FormData = new FormData();

        form.append('viewaction', 'auftragsstueckliste:raw-angebot');
        form.append('kdnr', this.kundennummer as unknown as string);
    
        form.append('aunr', aunr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region Auftrag
    GetAuftraege(aunr: any = undefined, nicht_bestellt: boolean = false): Observable<Auftrag[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftraege:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);

        if(aunr){
            form.append('aunr', aunr as unknown as string);
        }

        // Wenn true, dann sollen nur Aufträge angezeigt werden, die noch nicht bestellt worden sind
        form.append('nicht_bestellt', nicht_bestellt as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    AddAuftrag(
        auftrag: any,
        erfolgs_meldung: boolean = true,
    ): Observable<any | false> {
        let form: FormData = new FormData();
        form.append('viewaction', 'auftraege:anlegen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('bgnr', auftrag.baugruppe.bgnr as unknown as string);
        form.append('auftragsmenge', auftrag.auftragsmenge as unknown as string);
        form.append('auftragsart', auftrag.auftragsart as unknown as string);
        form.append('wunschtermin', auftrag.wunschtermin as unknown as string);
        form.append('aubemerkungkd', auftrag.aubemerkungkd as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                if(erfolgs_meldung){
                    // this.SuccessMitteilungErstellen(value)
                }

                return value.result
            })
        );
    }

    UpdateAuftraeg(auftrag: any): Observable<number | false> {
        let form: FormData = new FormData();
        
        form.append('viewaction', 'auftraege:aktualisieren');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', auftrag.aunr as unknown as string);
        form.append('bgnr', auftrag.bgnr as unknown as string);
        
        form.append('auftragsmenge', auftrag.auftragsmenge as unknown as string);
        form.append('auftragsart', auftrag.auftragsart as unknown as string);
        form.append('wunschtermin', auftrag.wunschtermin as unknown as string);
        form.append('aubemerkungkd', auftrag.aubemerkungkd as unknown as string);
        form.append('mplanfrage', auftrag.mplanfrage as unknown as string);
        form.append('mplantwort', auftrag.mplantwort as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );   
    }

    LieferoptionBestaetigen(auftrag: any, wunschtermin: number|string): Observable<number | false> {
        let form: FormData = new FormData();
        
        form.append('viewaction', 'auftraege:lieferoption');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', auftrag.aunr as unknown as string);
        form.append('bgnr', auftrag.baugruppe.bgnr as unknown as string);
        
        form.append('wunschtermin', wunschtermin as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );   
    }

    AuftragIstBestellt(aunr: any): Observable<number | false> {
        let form: FormData = new FormData();
        
        form.append('viewaction', 'auftraege:ist-bestellt');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', aunr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );   
    }

    AuftragBestaetigen(aunr: any): Observable<number | false> {
        let form: FormData = new FormData();
        
        form.append('viewaction', 'auftraege:bestaetigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', aunr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );   
    }

    DeleteAuftraeg(auftragID: Bauteil): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftraege:loeschen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', auftragID as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                // this.SuccessMitteilungErstellen(value)

                return value.result;
            })
        );
    }

    GetKosten(): Observable<any[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftraege:kosten');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                let kosten: any = {};
                value.result.forEach((element: any) => {
                    let aunr = element.aunr
                    delete element.aunr
                    kosten[aunr] = element  
                });

                return kosten;
            })
        );
    }

    ZeitKalkulation(id: any, Mitteilung: boolean = true): Observable<true | false> {  
        let form: FormData = new FormData();    

        form.append('viewaction', 'auftraege:zeitkalkulation');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', id as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                if(Mitteilung) {
                    // this.SuccessMitteilungErstellen(value)
                }
                return true;
            })
        );
    }

    MaterialKalkulation(id: any, Mitteilung: boolean = true): Observable<true | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'auftraege:matkalk');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('aunr', id as unknown as string);
        form.append('art', "SLAU" as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                if(Mitteilung) {
                    // this.SuccessMitteilungErstellen(value)
                }
                return true;
            })
        );
    }

    verfuegbarkeitZuruecksetzen(art:string, id:string|number, letzteneuequellezpkt_beachten: boolean = false){
        let form: FormData = new FormData();

        form.append('viewaction', 'auftraege:verfuegbarkeitzuruecksetzen');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('art', art as unknown as string);

        form.append('letzteneuequellezpkt_beachten', letzteneuequellezpkt_beachten as unknown as string);

        if(art === "bgnr"){
            form.append('bgnr', id as unknown as string);
        }else if(art === "aunr"){
            form.append('aunr', id as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;    
                }

                return value.result;
            })
        );
    }

    QuellenAktualisieren(art: string, einzelpruef: any, bqnr: any, btnr: any, aunr: any, bgnr: any, slnr: any, slid: any, btnrkd: string = "", Mitteilung: boolean = true): Observable<true | false>{
        let form: FormData = new FormData();

        form.append('viewaction', 'auftraege:quellenakt');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('art', art as unknown as string);
        form.append('einzelpruef', einzelpruef ?? 0 as unknown as string);
        form.append('bqnr', bqnr ?? 0 as unknown as string);
        form.append('btnr', btnr ?? 0 as unknown as string);
        form.append('bgnr', bgnr ?? 0 as unknown as string);
        form.append('aunr', aunr ?? 0 as unknown as string);
        form.append('slnr', slnr ?? 0 as unknown as string);
        form.append('slid', slid ?? 0 as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));

                    // Ausnahmsweise wird die Fehlermeldung hier angezeigt, statt in dem 'error.interceptor.ts' 
                    // #region Fehlermeldung
                    if(Mitteilung){
                        let data: {message: string, todo?: string}
                        let message = ""

                        if(btnrkd != undefined && btnrkd != null && btnrkd != ""){
                            message = btnrkd + ": ";
                        }

                        data = { 
                            message: message + value.message.notification 
                        };
                        if(value.message.todo){
                            data.todo = value.message.todo;
                        }

                        // this.mitteilungService.createMessage(data , "warning")
                    }
                    //#endregion

                    return false;    
                }

                if(Mitteilung){
                    // this.SuccessMitteilungErstellen(value, btnrkd)
                }
                
                return value.result;
            })
        );
    }

    QuellenAktualisierenNew(art: string, einzelpruef: any, aunr: any, slnr: any, btnrkd:any, slid: any, baugruppenmenge: any, Mitteilung: boolean = true): Observable<true | false>{
        let form: FormData = new FormData();

        form.append('viewaction', 'auftraege:quellenaktnew');
        form.append('kdnr', this.kundennummer as unknown as string);
        form.append('art', art as unknown as string);
        form.append('einzelpruef', einzelpruef ?? 0 as unknown as string);
        form.append('baugruppenmenge', baugruppenmenge ?? 0 as unknown as string);

        switch(art){
            case 'AUNR':
                form.append('nr', aunr as unknown as string);
                break;
            case 'AUSLNR':
                form.append('nr', slid as unknown as string);
                break;
            case 'SLNR':
                form.append('nr', slnr as unknown as string);
                break;
        }

        // Wird für die Fehlermeldung verwendet.
        // Später die Fehlermeldung in PHP umbauen!
        form.append('btnrkd', btnrkd ?? "" as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));

                    // Ausnahmsweise wird die Fehlermeldung hier angezeigt, statt in dem 'error.interceptor.ts' 
                    // #region Fehlermeldung
                    if(Mitteilung){
                        let data: {message: string, todo?: string}
                        let message = ""

                        if(btnrkd != undefined && btnrkd != null && btnrkd != ""){
                            message = btnrkd + ": ";
                        }

                        data = { 
                            message: message + value.message.notification 
                        };
                        if(value.message.todo){
                            data.todo = value.message.todo;
                        }

                        // this.mitteilungService.createMessage(data , "warning")
                    }
                    //#endregion

                    return false;
                }

                if(Mitteilung){
                    // this.SuccessMitteilungErstellen(value, btnrkd)
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region Bezahlung (Stripe)
    CheckOut(aunr: any): Observable<any>{
        let form: FormData = new FormData();

        form.append('viewaction', 'stripe:createCheckout');
        form.append('kdnr', this.kundennummer as unknown as string);
    
        form.append('aunr', aunr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    CheckPayment(orderId: any, checkoutSessionId: any): Observable<any>{
        let form: FormData = new FormData();

        form.append('viewaction', 'stripe:checkPayment');
        form.append('kdnr', this.kundennummer as unknown as string);
    
        form.append('checkoutSessionId', checkoutSessionId as unknown as string);
        form.append('orderId', orderId as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region Bestellung
    BestellungAnlegen(aunr: any): Observable<Auftrag[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bestellung:anlegen');
        form.append('kdnr', this.kundennummer as unknown as string);
    
        form.append('aunr', aunr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    BestellungAnzeigen(bestellungID: any = undefined): Observable<Auftrag[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bestellung:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        if(bestellungID){
            form.append('bestellungID', bestellungID as unknown as string);
        }

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    BestellungAktualisieren(bestellungID: any, bestellmenge: number, beschreibung: string, rechnungsadresse: any): Observable<Auftrag[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bestellung:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('bestellungID', bestellungID as unknown as string);
        form.append('bestellmenge', bestellmenge as unknown as string);
        form.append('beschreibung', beschreibung as unknown as string);
        form.append('rechnungsadresse', rechnungsadresse as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    BestellungLoeschen(bestellungID: any): Observable<Auftrag[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'bestellung:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);
        
        form.append('bestellungID', bestellungID as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value?.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region Lieferant
    GetLieferant(): Observable<any>{
        let form: FormData = new FormData();

        form.append('viewaction', 'lieferanten:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region Kunde
    GetKunden(): Observable<Kunde[] | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'kunden:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                let kunden: Kunde[] = [];
                value.result.forEach((element: any) => {
                    let kunde: Kunde = {
                        kdnr: element.kdnr,
                        anrede: element.anrede,
                        firma: element.firma,
                        vorname: element.vorname,
                        nachname: element.nachname,
                        land: element.land,
                        strasse: element.strasse,
                        plz: element.plz,
                        ort: element.ort,
                        tel: element.tel,
                        mail: element.mail,
                        andereLieferadresse: element.anderelieferadresse
                            ? true
                            : false,
                        lianrede: element.lianrede,
                        livorname: element.livorname,
                        linachname: element.linachname,
                        liland: element.liland,
                        listrasse: element.listrasse,
                        liplz: element.liplz,
                        liort: element.liort,
                        litel: element.litel,
                        limail: element.limail,
                        andereRechnungsadresse: element.andererechnungsadresse
                            ? true
                            : false,
                        reanrede: element.reanrede,
                        revorname: element.revorname,
                        renachname: element.renachname,
                        reland: element.reland,
                        restrasse: element.restrasse,
                        replz: element.replz,
                        reort: element.reort,
                        retel: element.retel,
                        remail: element.remail,
                        versandart: element.versandart,
                        rechnungsversand: element.rechnungsversand,
                        sprache: element.sprache,
                        waehrung: element.waehrung,
                        ustidnr: element.ustidnr,
                    };

                    kunden.push(kunde);
                });
                
                return kunden;
            })
        );
    }

    GetKundendaten(): Observable<any> {
        let form: FormData = new FormData();

        form.append('viewaction', 'kundendaten:anzeigen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    UpdateKunde(kunde: any): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'kundendaten:aktualisieren');
        form.append('firma', kunde.firma as string);
        form.append('anrede', kunde.anrede as string);
        form.append('firstName', kunde.firstName as string);
        form.append('lastName', kunde.lastName as string);
        form.append('strasse', kunde.strasse as string);
        form.append('plz', kunde.plz as string);
        form.append('ort', kunde.ort as string);
        form.append('land', kunde.land as string);
        form.append('email', kunde.email as string);
        form.append('tel', kunde.tel as string);
        form.append(
            'andereLieferadresse',
            kunde.andereLieferadresse === 'true' ? 'true' : 'false'
        );
        form.append('lianrede', kunde.lianrede as string);
        form.append('lifirstName', kunde.lifirstName as string);
        form.append('lilastName', kunde.lilastName as string);
        form.append('listrasse', kunde.listrasse as string);
        form.append('liplz', kunde.liplz as string);
        form.append('liort', kunde.liort as string);
        form.append('liland', kunde.liland as string);
        form.append('limail', kunde.limail as string);
        form.append('litel', kunde.litel as string);
        form.append(
            'andereRechnungsadresse',
            kunde.andereRechnungsadresse === 'true' ? 'true' : 'false'
        );
        form.append('reanrede', kunde.reanrede as string);
        form.append('refirstName', kunde.refirstName as string);
        form.append('relastName', kunde.relastName as string);
        form.append('restrasse', kunde.restrasse as string);
        form.append('replz', kunde.replz as string);
        form.append('reort', kunde.reort as string);
        form.append('reland', kunde.reland as string);
        form.append('remail', kunde.remail as string);
        form.append('retel', kunde.retel as string);


        form.append('versandart', kunde.versandart as string);
        form.append('rechnungsversand', kunde.rechnungsversand as string);
        form.append('sprache', kunde.sprache as string);
        form.append('waehrung', kunde.waehrung as string);
        form.append('ustidnr', kunde.ustidnr as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }  

                return value.result;
            })
        );
    }

    AddKunden(kunde: Kunde): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'kunden:anlegen');
        
        form.append('firma', kunde.firma ?? "" as string);
        form.append('anrede', kunde.anrede ?? "" as string);
        form.append('vorname', kunde.vorname ?? "" as string);
        form.append('nachname', kunde.nachname ?? "" as string);
        form.append('land', kunde.land ?? "" as string);
        form.append('strasse', kunde.strasse ?? "" as string);
        form.append('plz', kunde.plz ?? "" as string);
        form.append('ort', kunde.ort ?? "" as string);
        form.append('tel', kunde.tel ?? "" as string);
        form.append('mail', kunde.mail ?? "" as string);
        form.append(
            'anderelieferadresse',
            kunde.andereLieferadresse ? '1' : '0'
        );
        form.append('lianrede', kunde.lianrede ?? "" as string);
        form.append('livorname', kunde.livorname ?? "" as string);
        form.append('linachname', kunde.linachname ?? "" as string);
        form.append('liland', kunde.liland ?? "" as string);
        form.append('listrasse', kunde.listrasse ?? "" as string);
        form.append('liplz', kunde.liplz ?? "" as string);
        form.append('liort', kunde.liort ?? "" as string);
        form.append('litel', kunde.litel ?? "" as string);
        form.append('limail', kunde.limail ?? "" as string);
        form.append(
            'andererechnungsadresse',
            kunde.andereRechnungsadresse ? '1' : '0'
        );
        form.append('reanrede', kunde.reanrede ?? "" as string);
        form.append('revorname', kunde.revorname ?? "" as string);
        form.append('renachname', kunde.renachname ?? "" as string);
        form.append('reland', kunde.reland ?? "" as string);
        form.append('restrasse', kunde.restrasse ?? "" as string);
        form.append('replz', kunde.replz ?? "" as string);
        form.append('reort', kunde.reort ?? "" as string);
        form.append('retel', kunde.retel ?? "" as string);
        form.append('remail', kunde.remail ?? "" as string);
        form.append('versandart', kunde.versandart ?? "" as string);
        form.append('rechnungsversand', kunde.rechnungsversand ?? "" as string);
        form.append('sprache', kunde.sprache ?? "" as string);
        form.append('waehrung', kunde.waehrung ?? "" as string);
        form.append('ustidnr', kunde.ustidnr ?? "" as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }
                return value.result;
            })
        );
    }

    DeleteKunde(kunde: Kunde): Observable<number | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'kunden:loeschen');
        form.append('kdnr', kunde.kdnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region Auth
    selectKundennr(kunde: Kunde){
        let form: FormData = new FormData();

        form.append('viewaction', 'kundennummer:anzeigen');
        form.append('kdnr', kunde.kdnr as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }
                // später token verwenden, um Kundennr zu verwalten
                this.kundennummer = value.result
                return [value.result];
            })
        );
    }

    loginkd(token: any){
        let form: FormData = new FormData();

        form.append('viewaction', 'kunden:login');
        form.append('wordpressToken', token as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    localStorage.removeItem('token');
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }
    //#endregion
    //#region etc
    GetFormFields(formName: string): Observable<any | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'kbfelder:select');
        form.append('form', formName);
        form.append('sprache', 'Deutsch');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                let result = value.result

                let FormatAendern :any = {}
                if(typeof(result) == "object"){
                    for(let x of result){
                        if(!FormatAendern[x['feldname']]){
                            FormatAendern[x['feldname']] = []    
                        }

                        FormatAendern[x['feldname']].push({
                            "name"      : x['anzeige'],
                            "standard"  : x['standard'],
                            "value"     : x['wert'],
                            "sort"      : x['sort']
                        })
                    }
                }

                return FormatAendern;
            })
        );
    }

    GetWunschtermin(): Observable<any | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'kbfelder:select');
        form.append('form', 'mplauftraege');
        form.append('sprache', 'Deutsch');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                let result = value.result

                let FormatAendern :any = {}
                if(typeof(result) == "object"){
                    for(let x of result){
                        if(!FormatAendern[x['feldname']]){
                            FormatAendern[x['feldname']] = []    
                        }

                        if(x['feldname'] == 'wunschtermin'){
                            FormatAendern[x['feldname']].push({
                                "name"      : x['anzeige'],
                                "standard"  : x['standard'],
                                "value"     : x['wert'],
                                "sort"      : x['sort'],
                                "info"      : +x['info']
                            })

                        }
                    }
                }

                const agbskd = FormatAendern['wunschtermin'].filter((tmp_value: any) => tmp_value?.name != null);

                return agbskd;
            })
        );
    }

    GetFehlerMeldungen(){
        let form: FormData = new FormData();

        form.append('viewaction', 'meldungen:fehler');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value?.result;
            })
        );
    }

    LeiterplattenFehlermeldungen(): Observable<any | false> {
        let form: FormData = new FormData();

        form.append('viewaction', 'meldungen:leiterplatten');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    getLetzteAenderung(){
        let form: FormData = new FormData();

        form.append('viewaction', 'sonstiges:version');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    getProduktion(){
        let form: FormData = new FormData();

        form.append('viewaction', 'sonstiges:produktion');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    getKundenNrAuswaehlenAktiv() {
        let form: FormData = new FormData();

        form.append('viewaction', 'sonstiges:kdnr_auswaehlen');
        form.append('kdnr', this.kundennummer as unknown as string);

        return this.http.post(this.url, form).pipe(
            map((value: any) => {
                if (!value.success) {
                    console.log("Fehler in " + form.get('viewaction'));
                    return false;
                }

                return value.result;
            })
        );
    }

    //#endregion
}
