import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

import { BackendService } from 'src/app/services/backend.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatStepper } from '@angular/material/stepper';

import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-import-bauteile-konfigurator',
  templateUrl: './import-bauteile-konfigurator.component.html',
  styleUrl: './import-bauteile-konfigurator.component.scss'
})
export class ImportBauteileKonfiguratorComponent {
  neues_projekt: boolean = false;
  
  spaltenZumAuswaehlen = [ // Wenn die Reihenfolge des Arrays geändert wird, muss in HTML unter "Folgende Optionen müssen einer Spalte zugeordnet sein:", die Variblen in [style.color] angepasst werden!
    {
      name: "POS",
      synonyme: ["pos", "bom", "bomposition"],
      spalte: 0,
      ausgewaehlt: false,
    },{
      name: "Bauteilbeschreibung",
      synonyme: ["Bauteilbeschreibung"],
      spalte: 1,
      ausgewaehlt: false,
    },{
      name: "Hersteller-Teile Nr.",
      synonyme: ["Hersteller-Teile Nr.", "Hersteller-Bauteil Nr.", "Herstellerteilenummer"],
      spalte: 2,
      ausgewaehlt: false,
      deaktiviert: false
    },{
      name: "Hersteller",
      synonyme: ["Hersteller"],
      spalte: 3,
      ausgewaehlt: false
    },{
      name: "Lieferanten-Teile Nr.",
      synonyme: ["Lieferanten-Teile Nr.", "Lieferanten-Teile Nummer", "Lieferantenbauteilnummer", "Lieferantenteilenummer", "Lieferanten-Bauteil Nr."],
      spalte: 4,
      ausgewaehlt: false,
      deaktiviert: false
    },{
      name: "Lieferant",
      synonyme: ["Lieferant", "Lieferantenname"],
      spalte: 5,
      ausgewaehlt: false
    },{
      name: "Elektrische Bezeichnung",
      synonyme: ["ElektrischeBezeichnung"],
      spalte: 6,
      ausgewaehlt: false
    },{
      name: "Menge",
      synonyme: ["AnzahlProBaugruppe", "Menge"],
      spalte: 7,
      ausgewaehlt: false,
    },{
      name: "Bemerkung",
      synonyme: ["Bemerkung"],
      spalte: 8,
      ausgewaehlt: false
    },{
      name: "Bauteil Nr.",
      synonyme: ["Bauteil Nr.", "Bauteilnummer"],
      spalte: 9,
      ausgewaehlt: false
    },{
      name: "Hersteller- und Lieferanten-Teile Nr.",
      synonyme: ["Hersteller- und Lieferanten-Teile Nr.", "Hersteller- und Lieferanten-Teile Nummer"],
      spalte: 10,
      ausgewaehlt: false,
      deaktiviert: false
    }
  ]

  datei: any;

  raw_excel: any
  arbeitsblaetter: any = []

  spaltenZumAnzeigen: any[] = [];
  spalten: any[] = []
  required_spalten_ausgewaehlt: boolean = false;

  vorschau_excel_tabelle_daten: MatTableDataSource<any> = new MatTableDataSource();
  vorschau_excel_tabelle_length: number = 0;

  angepasste_excel_tabelle_daten: MatTableDataSource<any> = new MatTableDataSource();
  angepasste_excel_tabelle_length: number = 0;

  ausgewaehlte_spalten: any = {}

  @ViewChild('stepper') private stepper: MatStepper| undefined;

  bereit:boolean = false;

  fehlermeldungen: any = { // Später die Fehlermeldungen in der SQL Datenbank verschieben. Mit verschiedenen Sprachen.
    "required-arbeitsblatt": "Wählen Sie ein Arbeitsblatt aus!",

    "required-kopfzeile": "Geben Sie eine Zeile an!",
    "numberAndAboveZero-kopfzeile": "Es sind nur Werte erlaubt, die größer als 0 sind!",
    "nichtVorhanden-kopfzeile": "Die Zeile konnte nicht gefunden werden!",
    
    "required-datenbereich_von": "Geben Sie eine Zeile an!",
    "numberAndAboveZero-datenbereich_von": "Es sind nur Werte erlaubt, die größer als 0 sind!",
    "nichtVorhanden-datenbereich_von": "Die Zeile konnte nicht gefunden werden!",
    
    "numberAndAboveZero-datenbereich_bis": "Es sind nur Werte erlaubt, die größer als 0 sind!",
    "nichtVorhanden-datenbereich_bis": "Die Zeile konnte nicht gefunden werden!"
  }

  ersterSchritt: FormGroup = this._formBuilder.group({
    arbeitsblatt: [
      '', 
      [
        Validators.required
      ]
    ],
    kopfzeile: [
      '', 
      [
        Validators.required, 
        (control: AbstractControl): { [key: string]: any } | null => {
          const isValid = !isNaN(control.value) && control.value > 0;
          return isValid ? null : { 'numberAndAboveZero': { value: control.value } };
        },
        (control: AbstractControl): { [key: string]: any } | null => {
          let arbeitsblatt
          if(this.ersterSchritt){
            arbeitsblatt = this.ersterSchritt?.get('arbeitsblatt')?.value
          }else{
            return null;
          }
          
          const isValid = -1 != this.raw_excel[arbeitsblatt].sheet.findIndex((value: any)=> value['index'] === control.value);
          return isValid ? null : { 'nichtVorhanden': { value: control.value } };
        }
      ]
    ],
    datenbereich_von: [
      '', 
      [
        Validators.required, 
        (control: AbstractControl): { [key: string]: any } | null => {
          const isValid = !isNaN(control.value) && control.value > 0;
          return isValid ? null : { 'numberAndAboveZero': { value: control.value } };
        },
        (control: AbstractControl): { [key: string]: any } | null => {
          let arbeitsblatt
          if(this.ersterSchritt){
            arbeitsblatt = this.ersterSchritt?.get('arbeitsblatt')?.value
          }else{
            return null;
          }
          
          const isValid = -1 != this.raw_excel[arbeitsblatt].sheet.findIndex((value: any)=> value['index'] === control.value);
          return isValid ? null : { 'nichtVorhanden': { value: control.value } };
        }
      ]
    ],
    datenbereich_bis: [
      '', 
      [
        (control: AbstractControl): { [key: string]: any } | null => {
          if (control.value === undefined || control.value === null || control.value === "") { // Wenn "datenbereich_bis" keinen Wert hat, wird automatisch die letze Zeile ausgewählt 
            return null;
          }
          const isValid = control.value > 0;
          return isValid ? null : { 'numberAndAboveZero': { value: control.value } };
        },
        (control: AbstractControl): { [key: string]: any } | null => {
          if (!control.value || control.value == "") { // Wenn "datenbereich_bis" keinen Wert hat, wird automatisch die letze Zeile ausgewählt 
            return null;
          }
          
          let arbeitsblatt
          if(this.ersterSchritt){
            arbeitsblatt = this.ersterSchritt?.get('arbeitsblatt')?.value
          }else{
            return null;
          }
          
          const isValid = -1 != this.raw_excel[arbeitsblatt].sheet.findIndex((value: any)=> value['index'] === control.value);
          return isValid ? null : { 'nichtVorhanden': { value: control.value } };
        }
      ]
    ]
  });
  zweiterSchritt: any = this._formBuilder.group({
    zeile: [{value: '', disabled: true,}], // wird nicht verwendet, "_formBuilder.group" benötigt mindestens einen Parameter
  });

  constructor(
    private backend: BackendService, 
    private mitteilungService: MitteilungService,
    private _formBuilder: FormBuilder,
    private router : Router
  ) {
    this.datei = this.router.getCurrentNavigation()?.extras.state?.['datei'];
    history.replaceState({}, document.title);

    if(this.router.url.includes(UtilUrl.neuesProjekt.neues_projekt[0])){
      this.neues_projekt = true;
    }
  }

  ngOnInit(): void {
    this.Get();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region GET und Vorbereitung
  Get() {
    if(!this.datei){
      this.ende(false)
      return
    }

    let subscription = this.backend.ImportExcelAnzeigen(this.datei).subscribe((value) => {
      subscription.unsubscribe();

      this.raw_excel = value

      if (value !== false && value !== null && value !== undefined) {
        this.arbeitsblaetter = [];
        if(Object.keys(value).length > 0){
          this.arbeitsblaetter = Object.keys(value)
        }

        if(this.arbeitsblaetter[0]){ // erstes Blatt standardmäßig auswählen
          this.ersterSchritt.get('arbeitsblatt')?.patchValue(this.arbeitsblaetter[0])
          this.daten_fuer_die_vorschau_tabelle_einrichten(this.arbeitsblaetter[0])
        }else{
          //this.mitteilungService.createMessage("Excel ist leer!", "danger");
          this.mitteilungService.createMessageDialog("Excel ist leer!");
        }

        this.bereit = true
      }
    });
  }

  daten_fuer_die_vorschau_tabelle_einrichten(arbeitsblatt: string | number){
    let tmp_spaltenZumAnzeigen: any = ["zeile"]
    let tmp_spalten: any = []

    if(!arbeitsblatt) return

    // Für die Angular Material Tabelle müssen die Spalten vorbereitet und zugewiesen werden
    if(this.raw_excel[arbeitsblatt].sheet.length > 0){
      let max_laenge_der_zeilen = 0;
      for (const x in this.raw_excel[arbeitsblatt].sheet) {
        max_laenge_der_zeilen = this.raw_excel[arbeitsblatt].sheet[x]["row"].length;
      }

      for (let index = 0; index < max_laenge_der_zeilen; index++) {
        tmp_spaltenZumAnzeigen.push(index.toString()) 
        
        tmp_spalten.push({
          id: index.toString(),
          label: null, // wird später 
          cell: (element: any) => `${ element[index] ?? '' }`,
          ausgewaehlt: undefined
        })

        if(!this.zweiterSchritt){
          this.zweiterSchritt = new FormGroup({[index.toString()]: new FormControl('')} )
        }else{
          this.zweiterSchritt?.addControl(index.toString(), new FormControl(''))
        }
      }
    }
    this.spaltenZumAnzeigen = tmp_spaltenZumAnzeigen
    this.spalten = tmp_spalten

    // Für den nächsten Schritt die ersten beiden Zeilen für den Tabellenkopf und Anfang des Datenbereiches auswählen
    this.ersterSchritt.get('kopfzeile')?.patchValue(
      this.raw_excel[ arbeitsblatt ].erste_zeile_mit_daten
    );
    this.ersterSchritt.get('datenbereich_von')?.patchValue(
      this.raw_excel[ arbeitsblatt ].zweite_zeile_mit_daten
    );

    // In die Vorschau Angular Material Tabelle einfügen
    this.vorschau_excel_tabelle_daten = new MatTableDataSource( this.raw_excel[ arbeitsblatt ].sheet );
    this.vorschau_excel_tabelle_length = this.raw_excel[ arbeitsblatt ].sheet.length;
    this.vorschau_excel_tabelle_daten._updateChangeSubscription()
  }
  //#endregion
  //#region Schritt 1
  arbeitsblatt_auswaehlen(event: Event){
    const arbeitsblatt = this.ersterSchritt.get('arbeitsblatt')?.value
    if(!arbeitsblatt){
      return
    }

    this.daten_fuer_die_vorschau_tabelle_einrichten(arbeitsblatt);
  }
  //#endregion
  //#region Schritt 2 
  selectionChange_stepper(event: StepperSelectionEvent){
    // Nur im letzten Schritt ausführen
    const istLetzterSchritt = event.selectedIndex === 1;
    if(!istLetzterSchritt){
      return
    }

    // Variablen aus der ersten FormGroup entnehmen
    const arbeitsblatt = this.ersterSchritt.get("arbeitsblatt")?.value
    if(!arbeitsblatt){
      if(this.stepper){
        this.stepper.previous();
      }
      return
    }

    const ausgewaehlte_kopfzeile = this.ersterSchritt.get("kopfzeile")?.value
    const ausgewaehlteZeile_datenbereich_von = parseInt(this.ersterSchritt.get("datenbereich_von")?.value ?? "");
    const ausgewaehlteZeile_datenbereich_bis = parseInt(this.ersterSchritt.get("datenbereich_bis")?.value ?? "")

    // Überprüfung der Kopfzeile und Datenbereich 
    if(!ausgewaehlte_kopfzeile){
      if(this.stepper){
        this.stepper.previous();
      }
      return
    }
    if(!ausgewaehlteZeile_datenbereich_von){
      if(this.stepper){
        this.stepper.previous();
      }
      return
    }

    // Index von der ausgewählten Zeile herausfinden
    let index_kopfzeile = this.raw_excel[arbeitsblatt].sheet.findIndex((value: any)=> value['index'] === ausgewaehlte_kopfzeile);

    let index_datenbereich_von = this.raw_excel[arbeitsblatt].sheet.findIndex((value: any)=> value['index'] === ausgewaehlteZeile_datenbereich_von);
    let index_datenbereich_bis;
    if(ausgewaehlteZeile_datenbereich_bis){
      index_datenbereich_bis = this.raw_excel[arbeitsblatt].sheet.findIndex((value: any)=> value['index'] === ausgewaehlteZeile_datenbereich_bis);
    }

    if(index_kopfzeile === -1){
      if(this.stepper){
        event.selectedIndex = 0
      }
      return
    }
    if(index_datenbereich_von === -1){
      if(this.stepper){
        this.stepper.previous();
      }
      return
    }
    if(index_datenbereich_bis === -1){
      if(this.stepper){
        this.stepper.previous();
      }
      return
    }

    // Kopfzeile und Datenbereich mit dem Index auswählen
    let kopfzeile = this.raw_excel[arbeitsblatt].sheet[index_kopfzeile]['row']

    let datenbereich;
    if(index_datenbereich_bis){
      datenbereich = this.raw_excel[arbeitsblatt].sheet.slice(index_datenbereich_von, index_datenbereich_bis +1)
    }else{
      datenbereich = this.raw_excel[arbeitsblatt].sheet.slice(index_datenbereich_von)
    }

    
    if(arbeitsblatt){
      // Index von Kopfzeile und Datenbereich verwenden, um die ausgewählten Daten in die Angular Material Tabelle hinzufügen
      if(this.raw_excel[arbeitsblatt].sheet.length > 0){
        
        let max_laenge_der_spalten = 0;
        for (const x in this.raw_excel[arbeitsblatt].sheet) {
          max_laenge_der_spalten = this.raw_excel[arbeitsblatt].sheet[x]["row"].length;
        }
  
        let tmp_spalten: any = []
        for (let row = 0; row < max_laenge_der_spalten; row++) {
          tmp_spalten.push({
            id: row.toString(),
            label: kopfzeile[row], // ausgewählter Tabellenkopf wird ausgewählt 
            cell: (element: any) => `${ element[row] ?? '' }`,
            ausgewaehlt: undefined
          })
        }
        this.spalten = tmp_spalten

        // In die Angular Material Tabelle einfügen
        this.angepasste_excel_tabelle_daten = new MatTableDataSource( datenbereich );
        this.angepasste_excel_tabelle_length = datenbereich.length;
        this.angepasste_excel_tabelle_daten._updateChangeSubscription();
      }

      // Kopfzeile überprüfen, ob die Spalten bereits zugeordnet werden können
      for (const [index, tmp_kopfzeile] of kopfzeile.entries()) {
        if(tmp_kopfzeile){
          const gefundene_spalte = this.spaltenZumAuswaehlen.filter((spalte: any) => {
            if(spalte?.synonyme){
              let gefundene_synonym = spalte.synonyme.filter((synonym: any) => {
                if(synonym && tmp_kopfzeile){
                  return synonym.replace(/\s+/g, '').toLowerCase() === tmp_kopfzeile.replace(/\s+/g, '').toLowerCase()
                }
                return false
              })

              return gefundene_synonym.length > 0
            }
            return false
          })
          if(gefundene_spalte.length > 0){
            this.zweiterSchritt.controls[index].patchValue(gefundene_spalte[0].spalte)
          }
        }
      }

      this.change_spalte_Ausgewaehlt()
    }
  }

  change_spalte_Ausgewaehlt(){
    const Alle_Spalten = this.zweiterSchritt.value
 
    // Alle 'ausgewählt' in 'spaltenZumAuswaehlen' wieder auf false setzen  
    for (const spalte_auswaehlen of this.spaltenZumAuswaehlen ) {
      spalte_auswaehlen.ausgewaehlt = false;
      spalte_auswaehlen.deaktiviert = false;
    }
 
    // Gehe alle FormController aus dem zweiten FormGroup durch.
    // Controller die etwas ausgewählt haben, sollen in 'spaltenZumAuswaehlen' als true gesetzt werden, um diese in HTML <Select> zu deaktivieren
    for (const key in Alle_Spalten) {
      if(!Alle_Spalten[key] || Alle_Spalten[key] == "" || Alle_Spalten[key] == -1){
        continue;
      }
 
      let gefunden: any = this.spaltenZumAuswaehlen.findIndex((value) => value.spalte == Alle_Spalten[key] )
     
      if(gefunden == -1){ // nicht gefunden
        continue
      }
     
      if(this.spaltenZumAuswaehlen[gefunden].spalte == 10){ // Falls "10: Hersteller und Lieferanten Teile Nr" ausgewählt ist, sollen "2:  Hersteller Teile Nr." und "4:  Lieferanten Teile Nr." nicht auswählbar sein.
        let herstellerBauteilNrIndex = this.spaltenZumAuswaehlen.findIndex((value) => value.spalte == 2 )
        this.spaltenZumAuswaehlen[herstellerBauteilNrIndex].deaktiviert = true
       
        let lieferantBauteilNrIndex = this.spaltenZumAuswaehlen.findIndex((value) => value.spalte == 4 )
        this.spaltenZumAuswaehlen[lieferantBauteilNrIndex].deaktiviert = true
     
      }
      if(this.spaltenZumAuswaehlen[gefunden].spalte == 2){ // Falls "2:  Hersteller Bauteil Nr." ausgewählt ist, soll "10: Hersteller und Lieferanten Teile Nr" nicht auswählbar sein.
        let Hersteller_Lieferanten_BauteilNrIndex = this.spaltenZumAuswaehlen.findIndex((value) => value.spalte == 10 )
        this.spaltenZumAuswaehlen[Hersteller_Lieferanten_BauteilNrIndex].deaktiviert = true
      }
      if(this.spaltenZumAuswaehlen[gefunden].spalte == 4){ // Falls "4:  Lieferanten Bauteil Nr." ausgewählt ist, soll "10: Hersteller und Lieferanten Teile Nr" nicht auswählbar sein.
        let Hersteller_Lieferanten_BauteilNrIndex = this.spaltenZumAuswaehlen.findIndex((value) => value.spalte == 10 )
        this.spaltenZumAuswaehlen[Hersteller_Lieferanten_BauteilNrIndex].deaktiviert = true
      }
      this.spaltenZumAuswaehlen[gefunden].ausgewaehlt = true
    }
 
    /*
      Folgende Spalten müssen zugeordnet sein:
        - "Bauteilbeschreibung"
        - "Hersteller-Teile Nr", "Lieferanten Teile Nr" oder "Hersteller und Lieferanten Teile Nr"
        - "Menge"
    */
    
    var required_beschreibung: boolean = false;
    var required_hersteller_nr: boolean = false;
    var required_lieferant_nr: boolean = false;
    var required_hersteller_nr_und_lieferant_nr: boolean = false;
    var required_menge: boolean = false;
    
    this.spaltenZumAuswaehlen.forEach(value => {
      if(value.spalte == 1 && value.ausgewaehlt == true){
        required_beschreibung = true;
      }else if(value.spalte == 2 && value.ausgewaehlt == true){
        required_hersteller_nr = true;
      }else if(value.spalte == 4 && value.ausgewaehlt == true){
        required_lieferant_nr = true;
      }else if(value.spalte == 10 && value.ausgewaehlt == true){
        required_hersteller_nr_und_lieferant_nr = true;
      }else if(value.spalte == 7 && value.ausgewaehlt == true){
        required_menge = true;
      }
    });

    if(
      required_beschreibung
      && (required_hersteller_nr || required_lieferant_nr || required_hersteller_nr_und_lieferant_nr)
      && required_menge
    ){
      this.required_spalten_ausgewaehlt = true;
    }else{
      this.required_spalten_ausgewaehlt = false;
    }
  }
  //#endregion
  //#region Sonstiges
  ende(ergebnis: any){
    if(this.neues_projekt){
      this.router.navigate(UtilUrl.neuesProjekt.import, { state: {ergebnis: ergebnis} });
    }else{
      this.router.navigate(UtilUrl.import.import, { state: {ergebnis: ergebnis} });
    }
  }

  zurueck(auswahl: number){
    if(auswahl === 1){
      this.router.navigate(UtilUrl.neuesProjekt.neues_projekt)
    }else if(auswahl === 2){
      this.router.navigate(UtilUrl.neuesProjekt.import, { state: {ergebnis: false}});
    }
  }
  //#endregion

}
