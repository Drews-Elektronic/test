import { Component, ViewChild, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { Subscribable, Subscriber, filter, take, tap } from 'rxjs';

import { Angebot } from 'src/app/interfaces/angebot';

import { BackendService } from 'src/app/services/backend.service';
import { WindowService } from 'src/app/services/window.service';
import { MitteilungService } from 'src/app/services/mitteilung.service';

import { DialogComponent } from 'src/app/views/.children/dialog/dialog.component';

import { MatDialog } from '@angular/material/dialog';

import { environment } from 'src/environments/environment';
import { Beistellung } from 'src/app/enum/beistellung';
import { LeiterplattenStatus } from 'src/app/enum/leiterplattenStatus';
import { UtilUrl } from 'src/app/utils/util.url';
import { LeiterplatteBeistellenDialogComponent } from 'src/app/views/.children/.dialog/leiterplatte-beistellen-dialog/leiterplatte-beistellen-dialog.component';

@Component({
  selector: 'mpl-baugruppen-leiterplatte',
  templateUrl: './baugruppen-leiterplatte.component.html',
  styleUrls: ['./baugruppen-leiterplatte.component.scss'],
})
export class BaugruppenLeiterplatteComponent {
  neues_projekt: boolean = false;
  neuer_auftrag: boolean = false;
  auftrag_fortfahren: boolean = false;

  auftrag: boolean = false;
  bestellung: boolean = false;
  baugruppenmenge: number = 0;

  bereit: boolean = false
  button_laden: boolean = false;
  bitte_warten_beistellung: boolean = false;

  bgnr: any;
  aunr: any;
  bgnrkd: string = "Es wird geladen.";
  statuslp: number | undefined;
  bestellungID: any;


  Standardkonfiguration: any = {}

  form: any = {};
  formFields: any;

  @ViewChild('ng_form')   ng_form:   NgForm | any;
  @ViewChild('html_form') html_form: NgForm | any;

  anzahl_interne_kupferdicke: number = 0;
  spezifische_optionen_anzeigen: boolean = false;

  meldungen: any;
  input_meldungen: any;
  input_meldungen_json: any;

  angebot!: Angebot;

  fensterFehlermeldung: any[] = []
  dialogFehlermeldung: any[] = []

  ASTTest: boolean = false

  observer_eine_stueckliste_pruefen: any;

  ibr_fehler_aus_datenbank: any;
  ibr_fehler_response: any;

  LeiterplattenStatus = LeiterplattenStatus

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private windowService: WindowService,
    private router: Router,
    private mitteilungService: MitteilungService,
    private dialog: MatDialog,
    private renderer: Renderer2
  ) {
    if(this.router.url.includes(UtilUrl.angebote.angebote[0])){
      this.auftrag = true;
    }
    if(this.router.url.includes(UtilUrl.bestellungen.bestellungen[0])){
      this.bestellung = true;
    }
    
    // Falls ein neues Projekt eingerichtet wird, soll durch die Variable "neues_projekt" spezielle Funktionen ausgelöst werden.
    // Aus dem Localstorage wird der baugruppenname entnommen
    if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
      this.neues_projekt = true;
      this.baugruppenmenge = localStorage.getItem('baugruppenmenge') as any as number;
    }else if(this.router.url.includes(UtilUrl.neuesAngebot.neues_angebot_baugruppen[0])){
      this.neuer_auftrag = true;
      this.baugruppenmenge = localStorage.getItem('baugruppenmenge') as any as number;
    }else if(this.router.url.includes(UtilUrl.angebotFortfahren.angebote[0])){
      this.auftrag_fortfahren = true;
      this.auftrag = true; // Weil in der Url 'auftrag' und nicht 'auftraege' verwendet wird, muss this.auftrag manuell auf True gesetzt werden
      // Später von "auftrag" zu "auftraege" oder "angebote" umstellen
    }
  }

  ngOnInit(): void {
    this.bgnr = this.route.snapshot.paramMap.get('bgnr');
    this.aunr = this.route.snapshot.paramMap.get('aunr');
    this.bestellungID = this.route.snapshot.paramMap.get('bestellungID');

    if(this.aunr){
      this.GetEinenAuftrag()
    } else if(this.bestellungID){
      this.GetEineBestellung()
    } else if(this.bgnr){
      this.GetEineBaugruppe()
      this.GetLeiterplatte()
    } 

    this.GetFormFields();
    this.GetFehlerMeldungen();

    this.GetLeiterplattenFehlermeldungen();

    this.GetLeiterplatteLogikFehler()

    /* Siehe Kommentar in der Funktion 'verfuegbarkeit_im_hintergrund_pruefen()'
    if(this.neues_projekt){
      this.verfuegbarkeit_im_hintergrund_pruefen();
    }
    */
  }

  ngAfterViewInit(){
    /* Vielleicht für Später, wenn eine interne Überprüfung der Felder stattfinden soll. 
    this.ng_form.valueChanges.subscribe(
      (value: any) => { // Diese Funktion wird jedesmal ausgeführt, wenn sich im Formular etwas ändert
        if(this.bereit){
          
        } 
      }
    )
    */
  }
  
  ngOnDestroy(){
    WindowService.closeFehlermeldungen();
    
    if(this.observer_eine_stueckliste_pruefen){
      this.observer_eine_stueckliste_pruefen.unsubscribe();
    }

    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetEineBaugruppe(){
    let subscription = this.backend
      .GetBaugruppen(this.bgnr)
      .subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.bgnrkd = value[0].bgnrkd
          this.statuslp = value[0].statuslp
        }

        this.bereit = true;
      });
  }

  GetEinenAuftrag(){
    let subscription = this.backend.GetAuftraege(this.aunr).subscribe((value: any) => {
      subscription.unsubscribe();

      if (value !== false) {
        this.bgnr = value[0].bgnr
        this.bgnrkd = value[0].bgnrkd

        this.baugruppenmenge = value[0].auftragsmenge

        this.GetEineBaugruppe()
        this.GetLeiterplatte()
      }
    });
  }

  GetEineBestellung(){
    let subscription = this.backend.BestellungAnzeigen(this.bestellungID).subscribe((value: any) => {
      subscription.unsubscribe();

      if (value !== false) {
        //this.bgnr = value[0].bgnr
        this.aunr = value[0].aunr
        this.bgnrkd = value[0].bgnrkd

        this.GetEinenAuftrag()

        // this.GetEineBaugruppe()
        // this.GetLeiterplatte()
      }
    });
  }

  GetLeiterplatte(){
    let subscription1 = this.backend.GetLeiterplatte(this.bgnr).subscribe((value) => {
      subscription1.unsubscribe();

      if (value !== false) {

        if(value !== null){
          this.form = value
        }else{
          this.form = {}
        }
        
        this.InterneKupferDickenAnzeigen()

        this.bereit = true;
      }
    });

    let subscription2 = this.backend.GetLeiterplatteStandardkonfiguration("1").subscribe((value) => {
      subscription2.unsubscribe();
      if (value !== false) {
        if(value !== null){
          this.Standardkonfiguration = value
        }else{
          this.Standardkonfiguration = {}
        }
      }
    });
  }

  GetLeiterplatteLogikFehler(){
    let subscription = this.backend.LeiterplatteLogikFehlerAnzeigen().subscribe((value) => {
      subscription.unsubscribe();

      if (value !== false) {
        this.ibr_fehler_aus_datenbank = value;
      }
    });
  }

  GetFormFields(){
    let subscription = this.backend.GetFormFields("mplleiterplatte").subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.formFields = value;
      }
    });
  }

  GetFehlerMeldungen(){
    let subscription = this.backend.GetFehlerMeldungen().subscribe((value) => {
      subscription.unsubscribe();
      
      if (value !== false) {
        let tmp_value: any = {}
        value.forEach((element: any) => {
          tmp_value[element['id']] = element['detext']
        });
        this.meldungen = tmp_value;
      }
    });
  }

  GetLeiterplattenFehlermeldungen(){
    let subscription = this.backend.LeiterplattenFehlermeldungen().subscribe((value) => {
        subscription.unsubscribe();

        if(value !== false){
          this.input_meldungen = value;

          this.input_meldungen_json = {}
          value.forEach((element: any) => {
            this.input_meldungen_json[element.unterbereich] = element.text;
          });
        }
    });
  }

  //#endregion
  //#region Update
  UpdateLeiterplatte(): Promise<Boolean>{
    return new Promise((resolve, reject)=>{
      // Wenn die Leiterplatte beigestellt wird, soll sofort zum nächsten Schritt gegangen werden. 
      if(this.statuslp === LeiterplattenStatus.BEISTELLUNG){
        resolve(true)
      }

      if(this.ng_form.status !== "VALID"){
        this.openFehlerMeldungen()
        //this.mitteilungService.createMessage(this.meldungen?.[301], "danger");
        this.mitteilungService.createMessageDialog(this.meldungen?.[301]);
        reject()
      }
      
      if(this.bgnr === undefined){
        //this.mitteilungService.createMessage("Baugruppen Nummer wurde nicht gesetzt", "danger");
        this.mitteilungService.createMessageDialog("Baugruppen Nummer wurde nicht gesetzt");
        return;
      }

      // Wenn es ein neues Projekt ist, dann wird die Stueckliste im Hintergrund geprueft. 
      // Hier soll die Prüfung abgebrochen werden und keine weiteren Observer subscriben.
      if( this.neues_projekt && this.observer_eine_stueckliste_pruefen){
        this.observer_eine_stueckliste_pruefen.unsubscribe();
        this.observer_eine_stueckliste_pruefen = false;
      }

      this.button_laden = true

      this.formular_all_css_classes_entfernen("ibr-fehlermeldung")

      let subscription1 = this.backend.UpdateLeiterplatte(this.form, false).subscribe((value) => {
        subscription1.unsubscribe();
      
        let baugruppenmenge;
        if(this.neues_projekt || this.neuer_auftrag || this.auftrag_fortfahren){
          baugruppenmenge = this.baugruppenmenge
        }

        let subscription2 = this.backend
          .leiterplatteanfragen(this.bgnr, undefined, baugruppenmenge, this.ASTTest)
          .subscribe((value: any) => {
            subscription2.unsubscribe();

            if(value[0] !== false){
              resolve(true)
            } else if(!value[0]){ // IBR Anfrage war fehlerhaft! Felder rot markieren und Fehlermeldung anzeigen
              let anzeige: any[] = [];

              if(value[1].errors && value[1].errors.length > 0){
                for(let errors of value[1].errors){
                  let errorText: string = "";
                  for(let [i, tmp_errorfelder] of errors.errorfelder.entries() ){
                    if(tmp_errorfelder){
                      /// Fehler entnehmen und für die Fehlermeldung zwischenspeichern
                      if(i !== 0 && i !== errors.errorfelder.length){
                        errorText += ", \n";
                      }
                      errorText += tmp_errorfelder;

                      /// Formular Felder rot markieren
                      let formular_feld = tmp_errorfelder.toLowerCase();

                      // Wenn im 'nutzenTyp' 'Einzelstück' ausgeswählt ist, sind laengeeinzel und breiteeinzel mit laenge und breite vertauscht
                      if (this.ng_form.form.controls['nutzenTyp'].value == 0) {
                        // laengeeinzel und breiteeinzel mit laenge und breite tauschen
                        if(formular_feld === 'laengeeinzel'){
                          this.renderer.addClass(this.html_form.nativeElement.elements['laenge'], "ibr-fehlermeldung");
                          continue;
                        } else if (formular_feld === 'breiteeinzel'){
                          this.renderer.addClass(this.html_form.nativeElement.elements['breite'], "ibr-fehlermeldung");
                          continue;
                        }
                      }
                      
                      if( this.ng_form.form.controls[formular_feld] ){
                        this.renderer.addClass(this.html_form.nativeElement.elements[formular_feld], "ibr-fehlermeldung");
                      }
                    }
                  }
                  anzeige.push({
                    anzeige: errors.anzeige,
                    //felder: errorText
                  })
                }
              }else if(value[1].response && value[1].response.error){
                anzeige.push({
                  anzeige: value[1].response.error
                })
              }else{
                anzeige.push({
                  anzeige: "Unbekannter Fehler. Melden Sie es dem IT-Support."
                })
              }

              const daten = {
                table: anzeige, 
                columns: [
                  //{id:"felder", label:"Felder"}, 
                  {id:"anzeige", label:"Beschreibung"}
                ],
                title: this.neues_projekt ? "Damit Sie fortfahren können, müssen die Fehler behoben werden!" : "Beheben Sie die Fehler, bevor Sie fortfahren!"
              }

              // Fehlermeldungen in der Globalen Variable speichern, um diese in einer Tabelle im Child Komponente 'mpl-fehlermeldungen' anzuzeigen	
              this.ibr_fehler_response = Object.assign({}, daten);
              
              // Scroll zum Seitenanfang
              window.scrollTo({ top: 0, behavior: 'smooth' });

              // Speichere die Fehler im Service, bzw. LocalStorage, um, wenn man möchte, eine Fehlermeldungs Fenster zu öffnen. 
              // Der Knopf zum öffnen, des Fensters befindet sich im Header
              this.windowService.setFehlermeldungen(
                daten.table, 
                daten.columns,
                daten.title
              )

              // Öffne ein Material Dialog Popup (soll das Fehlermeldungs Fenster ersetzen)
              //this.windowService.openFehlerMeldungenDialog(anzeige, [ {id:"felder", label:"Felder"}, {id:"anzeige", label:"Beschreibung"}], "Leiterplatten")
            
              resolve(false)
            }

            this.button_laden = false;
          }, (error)=>{
            console.error(error)
            this.button_laden = false;
          });
        }, (error)=>{
          console.error(error)
          this.button_laden = false;
        });
    })
    


  }
  //#endregion
  //#region Beistellen
  LeiterplatteBeistellen(){
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        titel: "Leiterplatte beistellen",
        content: "Soll die Leiterplatte von ihnen beigestellt werden?",
        ja_button_content: "Beistellen",
        ja_button_style: "success",
        nein_button_exist_not: true
      }
    });

    let subscription1 = dialogRef.afterClosed().pipe(
        take(1),
        filter((result: any) => result != undefined),   // Abbrechen
        tap((value1: any) => {                          // ja: true; nein: false;
          subscription1.unsubscribe();

          const dialogRef = this.dialog.open(LeiterplatteBeistellenDialogComponent, {
            width: '500px'
          });
      
          let subscription2 = dialogRef.afterClosed().pipe(
            take(1),
            filter((result: any) => result != undefined),   // Abbrechen
            tap((value2: any) => {                          // ja: true; nein: false;
              subscription2.unsubscribe();
  
              this.bitte_warten_beistellung = true;
              this.button_laden = false;
  
              if(value2){
                let subscription3 = this.backend
                  .LeiterplatteBeistellen(this.bgnr)
                  .subscribe((value: any) => {
                    subscription3.unsubscribe();
          
                    if(value !== false){
                      this.statuslp = 6
                    }
    
                    this.bitte_warten_beistellung = false;
                  });
              }
              
            })
          ).subscribe();
        })
    ).subscribe();
  }

  LeiterplatteBeistellenLoeschen(){
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        titel: "Leiterplatte beschaffen",
        content: "Soll die Leiterplatte von uns beschaft werden?",
        ja_button_content: "Beschaffen",
        ja_button_style: "success",
        nein_button_exist_not: true
      }
    });

    let subscription1 = dialogRef.afterClosed().pipe(
        take(1),
        filter((result: any) => result != undefined),   // Abbrechen
        tap((result: any) => {                          // ja: true; nein: false;
            subscription1.unsubscribe();

            this.bitte_warten_beistellung = true;

            let subscription3 = this.backend
              .LeiterplatteBeistellenLoeschen(this.bgnr)
              .subscribe((value: any) => {
                subscription3.unsubscribe();
      
                if(value !== false){
                  this.statuslp = 2
                }

                this.bitte_warten_beistellung = false;
              });
        })
    ).subscribe();
  }
  //#endregion
  //#region Formular Funktion
  InterneKupferDickenAnzeigen() {
    let lagen = parseInt(this.form?.["lagen"] ?? "1")
    const count = Math.ceil(lagen / 2) - 1;
    this.anzahl_interne_kupferdicke = count;
  }

  standardkonfiguration(){
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        titel: "Standardkonfigurationsdaten übernehmen",
        content: "Wenn Sie die Standardkonfiguration wählen, werden die aktuellen Daten mit den Standardkonfigurationsdaten überschrieben.",
        ja_button_content: "Ja",
        ja_button_style: "success",
        nein_button_exist_not: true
      }
    });

    let subscription1 = dialogRef.afterClosed().pipe(
        take(1),
        filter((result: any) => result != undefined),   // Abbrechen
        tap((result: any) => {                          // ja: true; nein: false;
            subscription1.unsubscribe();

            if(this.Standardkonfiguration && Object.keys(this.Standardkonfiguration).length !== 0) {
              for (const key in this.Standardkonfiguration) {
                this.form[key] = this.Standardkonfiguration[key];
              }
            }else{
              this.form = {}
            }
        })
    ).subscribe();
  }

  leiterplatteanfragen(){
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        titel: "Wollen Sie wirklich die Leiterplatte senden?",
        ja_button_content: "Ja",
        ja_button_style: "success",
        nein_button_exist_not: true
      }
    });

    let subscription1 = dialogRef.afterClosed().pipe(
      take(1),
      filter((result: any) => result != undefined),   // Abbrechen
      tap((result: any) => {                          // ja: true; nein: false;
        subscription1.unsubscribe();

        this.formular_all_css_classes_entfernen("ibr-fehlermeldung")

        let subscription2 = this.backend.UpdateLeiterplatte(this.form, false).subscribe((value) => {
          subscription2.unsubscribe();
        
          let subscription3 = this.backend
            .leiterplatteanfragen(bgnr, undefined, undefined, this.ASTTest)
            .subscribe((value: any) => {
              subscription3.unsubscribe();
    
              // IBR Anfrage war fehlerhaft! Felder rot markieren und Fehlermeldung anzeigen 
              if(!value[0]){
                let anzeige: any[] = [];
    
                for(let errors of value[1].errors){
                  let errorText: string = "";
                  for(let [i, tmp_errorfelder] of errors.errorfelder.entries() ){
                    if(tmp_errorfelder){
                      /// Fehler entnehmen und für die Fehlermeldung zwischenspeichern
                      if(i !== 0 && i !== errors.errorfelder.length){
                        errorText += ", \n";
                      }
                      errorText += tmp_errorfelder;

                      /// Formular Felder rot markieren
                      let formular_feld = tmp_errorfelder.toLowerCase();

                      // Wenn im 'nutzenTyp' 'Einzelstück' ausgeswählt ist, sind laengeeinzel und breiteeinzel mit laenge und breite vertauscht
                      if (this.ng_form.form.controls['nutzenTyp'].value == 0) {
                        // laengeeinzel und breiteeinzel mit laenge und breite tauschen
                        if(formular_feld === 'laengeeinzel'){
                          this.renderer.addClass(this.html_form.nativeElement.elements['laenge'], "ibr-fehlermeldung");
                          continue;
                        } else if (formular_feld === 'breiteeinzel'){
                          this.renderer.addClass(this.html_form.nativeElement.elements['breite'], "ibr-fehlermeldung");
                          continue;
                        }
                      }
                      
                      if( this.ng_form.form.controls[formular_feld] ){
                        this.renderer.addClass(this.html_form.nativeElement.elements[formular_feld], "ibr-fehlermeldung");
                      }
                    }
                  }
                  anzeige.push({
                    anzeige: errors.anzeige,
                    //felder: errorText
                  })
                }
    
                this.ibr_fehler_response = anzeige;
                
                // Speichere die Fehler im Service, bzw. LocalStorage, um, wenn man möchte, eine Fehlermeldungs Fenster zu öffnen. 
                // Der Knopf zum öffnen, des Fensters befindet sich im Header
                this.windowService.setFehlermeldungen(anzeige, 
                  //[{id:"felder", label:"Felder"}, {id:"anzeige", label:"Beschreibung"}], 
                  [{id:"anzeige", label:"Beschreibung"}], 
                  "Leiterplatten")

                // Öffne ein Material Dialog Popup (soll das Fehlermeldungs Fenster ersetzen)
                //this.windowService.openFehlerMeldungenDialog(anzeige, [ {id:"felder", label:"Felder"}, {id:"anzeige", label:"Beschreibung"}], "Leiterplatten")
              }
            });
        });
      })
    ).subscribe();

    let bgnr = this.form?.["bgnr"]
  }

  formular_all_css_classes_entfernen(cssClass: string){
    let nativeElement = this.html_form.nativeElement
    for (const x in nativeElement) {
      if(x === '__ngContext__'){
        break;
      }

      this.renderer.removeClass(nativeElement[x], cssClass);
    }
  }

  nutzentypGeaendert_FelderZuruecksetzen(){
    for (const iterator of ['breite', 'laenge','breiteeinzel' ,'laengeeinzel' ,'nutzenzahl' ,'ritzen' ,'sprungritzen' ,'fraesen' ,'nutzenkeinexout' ,'nutzenaufbau' ,'fraesdurchmesser' ,]) {
      this.form[iterator] = this.Standardkonfiguration[iterator];
    }    
  }
  //#endregion
  //#region Fehlermeldungen
  openFehlerMeldungen(){
    // Entnehme alle Fehler aus dem Formular
    let fehler: any = []
    // <label> und 'for' wird benötigt!
    // Alle <label> auswählen und über 'for' die ID entnehmen, die ID verwenden, um den <input> rauszufinden
    for(let element of this.html_form.nativeElement.querySelectorAll('label')){
      // Über 'for' die ID entnehmen und die ID verwenden, um den <input> rauszufinden
      const controlErrors = this.ng_form.form.get(element.htmlFor)?.errors;
      if (controlErrors) {
        // Alle Fehler entnehmen
        let errors = Object.keys(controlErrors).filter(tmp_key => controlErrors[tmp_key] === true);
        for (const error of errors) {
          switch(error){
            case "required":
              let fehlermeldung = this.input_meldungen.find((value: any)=>value['unterbereich'] === "required-" + element.htmlFor);
              if(fehlermeldung){
                fehler.push({
                  felder: element.textContent, 
                  message: fehlermeldung['text']
                })
              }else{
                fehler.push({
                  felder: element.textContent, 
                  message: "Unbekannter Fehler. Support bescheid geben."
                })
              }
              
              break;
          }
        }
      }
    }

    // Speichere die Fehler im Service, bzw. LocalStorage und öffne ein neues Fenster
    this.windowService.setFehlermeldungen(fehler, [{id:"felder", label:"Bereich"}, {id:"message", label:"Beschreibung"}])
    //this.windowService.openFehlerMeldungenDialog(fehler, [{id:"felder", label:"Bereich"}, {id:"message", label:"Beschreibung"}])
  }
  //#endregion
  //#region Umleitung
  weiter(){
    if(this.neues_projekt){
      this.UpdateLeiterplatte().then((value: any) =>{
        if(value){
          this.router.navigate(UtilUrl.neuesProjekt.bom(this.bgnr))
        }
      })
    }else if(this.neuer_auftrag){
      this.UpdateLeiterplatte().then((value: any) =>{
        if(value){
          this.router.navigate(UtilUrl.neuesAngebot.bom(this.bgnr))
        }
      })
    }else if(this.auftrag_fortfahren){
      this.UpdateLeiterplatte().then((value: any) =>{
        if(value){
          this.router.navigate(UtilUrl.angebotFortfahren.bom(this.bgnr, this.aunr))
        }
      })
    }else{
      this.UpdateLeiterplatte().then((value: any) =>{
        if(value){
          this.router.navigate(UtilUrl.angebote.bom(this.bgnr, this.aunr))
        }
      })
    }
    this.ibr_fehler_response = null;
  }

  zurueck(){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.import)
    }else if(this.neuer_auftrag){
      this.router.navigate(UtilUrl.neuesAngebot.neues_angebot(this.bgnr))
    }else if(this.auftrag_fortfahren){
      this.router.navigate(UtilUrl.angebotFortfahren.angebot_fortfahren(this.bgnr, this.aunr))
    }else if(this.bestellung){
      this.router.navigate(UtilUrl.bestellungen.bestellungen)
    }else{
      
      if(this.router.url.includes(UtilUrl.angebote.angebote[0])){
        this.router.navigate(UtilUrl.angebote.unterlagen(this.bgnr, this.aunr))
      }else{
        this.router.navigate(UtilUrl.baugruppen.baugruppen)
      }
    }
  }
  //#endregion
  //#region Verfügbarkeit Prüfung
  // Deaktiviert
  // Es löst einen Deadlock im nächsten Schritt aus.  
  // Sobald der Kunde zum nächsten Schritt geht, scheitert PHP die Stückliste anzuzeigen, weil PHP und die Datenbank noch mit dieser Abfrage beschäftigt sind.
  verfuegbarkeit_im_hintergrund_pruefen(){ 
    let subscription1 = this.backend
      .GetStueckliste(this.bgnr)
      .subscribe((value) => {
        subscription1.unsubscribe();
        if (value !== false) {
          let KomprimierteStueckliste: any[] = value.filter((tmp_value: any) => tmp_value?.komprimierung === 1);

          if(KomprimierteStueckliste.length !== 0){
            let subscription2 = this.backend
              .verfuegbarkeitZuruecksetzen("bgnr", this.bgnr)
              .pipe(take(1))
              .subscribe(async (value) => {
                subscription2.unsubscribe();
        
                if(value !== false){
                  // Die Stückliste/BOM Schritt für Schritt durchgehen und die Verfügbarkeit prüfen
                  for (const tmp_komp_sl of KomprimierteStueckliste) {
                    if(tmp_komp_sl['agbskd'] == Beistellung.BESCHAFFUNG && this.observer_eine_stueckliste_pruefen !== false){
                      await this.async_QuellenAktualisieren(tmp_komp_sl);
                    }
                  }
                }
              });
          }
          
        }
      });
  }

  async async_QuellenAktualisieren(sl: any) {
    return new Promise((resolve, reject) => {
      this.observer_eine_stueckliste_pruefen = this.backend
      //.QuellenAktualisieren("SLNR", 1, 0, 0, 0, sl.bgnr, sl.slnr, 0, sl.btnrkd, false)
        .QuellenAktualisierenNew("SLNR", 1, 0, sl.slnr, sl.btnrkd, 0, this.baugruppenmenge, false)
        .pipe(take(1))
        .subscribe((value: any) => {
          resolve(value);
        });
    })
  }
  //#endregion

}
