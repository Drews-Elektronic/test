import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Keycloak_AuthGuard } from './keycloak.auth.guard';

import { BaugruppenComponent } from './views/.formulare/baugruppen/baugruppen.component';
import { BaugruppenAnlegenComponent } from './views/.formulare/baugruppen/baugruppen-anlegen/baugruppen-anlegen.component';
import { BaugruppenLeiterplatteComponent } from './views/.formulare/baugruppen/baugruppen-leiterplatte/baugruppen-leiterplatte.component';
import { BaugruppenStuecklisteComponent } from './views/.formulare/baugruppen/baugruppen-stueckliste/baugruppen-stueckliste.component';
import { AuftraegeComponent } from './views/.formulare/auftraege/auftraege.component';
import { AuftraegeAnlegen2Component } from './views/.formulare/auftraege/auftraege-anlegen/auftraege-anlegen.component';
import { AuftraegeStuecklisteComponent } from './views/.formulare/auftraege/auftraege-stueckliste/auftraege-stueckliste.component'
import { BauteileComponent } from './views/.formulare/bauteile/bauteile.component';
import { BauteileAnlegenComponent } from './views/.formulare/bauteile/bauteile-anlegen/bauteile-anlegen.component';
import { ImportBauteileTabelleComponent } from './views/.formulare/import/import-bauteile-tabelle.component';
import { ImportBauteilAnlegenComponent } from './views/.formulare/import/import-bauteil-anlegen/import-bauteil-anlegen.component';
import { KundenUebersichtComponent } from './views/.sonstiges/kunden/kunden-uebersicht.component';
import { KundenAnlegenComponent } from './views/.sonstiges/kunden/kunden-anlegen/kunden-anlegen.component';
import { KundendatenComponent } from './views/kundendaten/kundendaten.component';
import { ViewMenuComponent } from './views/view-menu/view-menu.component';
import { VorschlaegeComponent } from './views/.sonstiges/vorschlaege/vorschlaege.component';
import { LoginComponent } from './views/.sonstiges/login/login.component';
import { UnterlagenComponent } from './views/.formulare/unterlagen/unterlagen.component';
import { FensterFehlermeldungenComponent } from './views/.children/.fehlermeldung/fenster_fehlermeldungen/fensterfehlermeldungen.component';
import { ImportBauteileKonfiguratorComponent } from './views/.formulare/import/import-bauteile-konfigurator/import-bauteile-konfigurator.component';
import { AlternativesBauteilSuchenComponent } from './views/.formulare/alternatives-bauteil-suchen/alternatives-bauteil-suchen.component';
import { NeuesProjektComponent } from './views/.formulare/neues-projekt/neues-projekt.component';
import { AuftraegeStuecklisteVergleichComponent } from './views/.formulare/auftraege/auftraege-stueckliste-vergleich/auftraege-stueckliste-vergleich.component';
import { AuftraegeZusammenfassungComponent } from './views/.formulare/auftraege/auftraege-zusammenfassung/auftraege-zusammenfassung.component';
import { AuftragAnlegenComponent } from './views/.formulare/auftrag-anlegen/auftrag-anlegen.component';
import { UnberechtigtComponent } from './views/.sonstiges/unberechtigt/unberechtigt.component';
import { environment } from 'src/environments/environment';
import { LeererGuard } from './leerer.guard';
import { AuftraegeBestaetigenComponent } from './views/.formulare/auftraege/auftraege-bestaetigen/auftraege-bestaetigen.component';
import { BestellungenComponent } from './views/.formulare/bestellungen/bestellungen.component';
import { BauteilSucheComponent } from './views/.formulare/bauteil-suche/bauteil-suche.component';

import { UtilUrl } from './utils/util.url';
import { CheckoutErfolgreichComponent } from './views/.formulare/checkout/checkout-erfolgreich/checkout-erfolgreich.component';

const AuthGuard = environment.keycloak_deaktivieren ? LeererGuard : Keycloak_AuthGuard;

const getRoute = (url_array: any[])=>{
    let result = "";
    if(url_array){
        if(url_array.length === 1){
            result = url_array[0];
        }else{
            result = url_array.join("/");
        }
    }
    
    return result
}

const routes: Routes = [
    
    { path: getRoute(UtilUrl.login), component: LoginComponent},

    { path: getRoute(UtilUrl.menu), component: ViewMenuComponent, canActivate: [AuthGuard]},

    /****************************************************
     *** Ablauf, um einen Neuen Auftrag zu erstellen  ***
     ************************************************* */
    // Neues Projekt
    { path: getRoute(UtilUrl.neuesProjekt.neues_projekt), component: NeuesProjektComponent, canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.neuesProjekt.import), component: ImportBauteileTabelleComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.neuesProjekt.import_konfiguration), component: ImportBauteileKonfiguratorComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.neuesProjekt.import_anlegen), component: ImportBauteilAnlegenComponent , canActivate: [AuthGuard] },   // Eine Import Zeile anlegen
    { path: getRoute(UtilUrl.neuesProjekt.leiterplatte(':bgnr')), component: BaugruppenLeiterplatteComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesProjekt.bom(':bgnr')), component: BaugruppenStuecklisteComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesProjekt.alternativ(':bgnr', ':slnr')), component: AlternativesBauteilSuchenComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesProjekt.vergleichen(':bgnr', ':aunr')), component: AuftraegeStuecklisteVergleichComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.neuesProjekt.vergleichen_alternativ(':bgnr', ':aunr')), component: AlternativesBauteilSuchenComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesProjekt.zusammenfassung(':bgnr', ':aunr')), component: AuftraegeZusammenfassungComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.neuesProjekt.bestaetigen(':bgnr', ':aunr')), component: AuftraegeBestaetigenComponent , canActivate: [AuthGuard] },

    // einen neuen Auftrag über den Ablauf erstellen
    { path: getRoute(UtilUrl.neuesAngebot.neues_angebot_baugruppen), component: AuftragAnlegenComponent , canActivate: [AuthGuard] }, // Wenn in /auftraege ein neuer Auftrag erstellt werden soll // wird nicht mehr benötigt
    { path: getRoute(UtilUrl.neuesAngebot.neues_angebot(':bgnr')), component: AuftragAnlegenComponent , canActivate: [AuthGuard] }, // Wenn in /baugruppen ein neuer Auftrag erstellt werden soll
    { path: getRoute(UtilUrl.neuesAngebot.leiterplatte(':bgnr')), component: BaugruppenLeiterplatteComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesAngebot.bom(':bgnr')), component: BaugruppenStuecklisteComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesAngebot.alternativ(':bgnr', ':slnr')), component: AlternativesBauteilSuchenComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesAngebot.vergleichen(':bgnr', ':aunr')), component: AuftraegeStuecklisteVergleichComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.neuesAngebot.vergleichen_alternativ(':bgnr', ':aunr')), component: AlternativesBauteilSuchenComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.neuesAngebot.zusammenfassung(':bgnr', ':aunr')), component: AuftraegeZusammenfassungComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.neuesAngebot.bestaetigen(':bgnr', ':aunr')), component: AuftraegeBestaetigenComponent , canActivate: [AuthGuard] },

    // Einen gespeicherten Auftrag fortfahren
    { path: getRoute(UtilUrl.angebotFortfahren.angebot_fortfahren(':bgnr', ':aunr')), component: AuftragAnlegenComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebotFortfahren.leiterplatte(':bgnr', ':aunr')), component: BaugruppenLeiterplatteComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.angebotFortfahren.bom(':bgnr', ':aunr')), component: AuftraegeStuecklisteComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.angebotFortfahren.vergleichen(':bgnr', ':aunr')), component: AuftraegeStuecklisteVergleichComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebotFortfahren.vergleichen_alternativ(':bgnr', ':aunr')), component: AlternativesBauteilSuchenComponent , canActivate: [AuthGuard] }, 
    { path: getRoute(UtilUrl.angebotFortfahren.zusammenfassung(':bgnr', ':aunr')), component: AuftraegeZusammenfassungComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebotFortfahren.bestaetigen(':bgnr', ':aunr')), component: AuftraegeBestaetigenComponent , canActivate: [AuthGuard] },

    /************************
     *** Haupt Funktionen ***
     ***********************/
    // Import
    { path: getRoute(UtilUrl.import.import), component: ImportBauteileTabelleComponent , canActivate: [AuthGuard] },   // Übersicht
    { path: getRoute(UtilUrl.import.konfiguration), component: ImportBauteileKonfiguratorComponent , canActivate: [AuthGuard] },   // Excel importieren
    { path: getRoute(UtilUrl.import.anlegen), component: ImportBauteilAnlegenComponent , canActivate: [AuthGuard] },   // Eine Import Zeile anlegen
    
    // Baugruppen
    { path: getRoute(UtilUrl.baugruppen.baugruppen), component: BaugruppenComponent, canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.baugruppen.anlegen), component: BaugruppenAnlegenComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.baugruppen.leiterplatte(':bgnr')), component: BaugruppenLeiterplatteComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.baugruppen.bom(':bgnr')), component: BaugruppenStuecklisteComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.baugruppen.alternativ(':bgnr',':slnr')), component: AlternativesBauteilSuchenComponent , canActivate: [AuthGuard] },
    
    // Kundenbauteile
    { path: getRoute(UtilUrl.kundenbauteil.kundenbauteil), component: BauteileComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.kundenbauteil.anlegen), component: BauteileAnlegenComponent , canActivate: [AuthGuard] },

    // Kunden
    { path: getRoute(UtilUrl.kunden.kundendaten), component: KundendatenComponent, canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.kunden.kunden), component: KundenUebersichtComponent, canActivate: [AuthGuard] }, // Wichtig: 'Mitarbeiter' Rechte vergeben!
    { path: getRoute(UtilUrl.kunden.anlegen), component: KundenAnlegenComponent, canActivate: [AuthGuard] }, // Wichtig: 'Mitarbeiter' Rechte vergeben!

    // Auftraege
    { path: getRoute(UtilUrl.angebote.angebote), component: AuftraegeComponent, canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebote.anlegen), component: AuftraegeAnlegen2Component , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebote.leiterplatte(':bgnr', ':aunr')), component: BaugruppenLeiterplatteComponent , canActivate: [AuthGuard] }, // 'auftrag/:aunr/leiterplatte'
    { path: getRoute(UtilUrl.angebote.bom(':bgnr', ':aunr')), component: AuftraegeStuecklisteComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebote.vergleichen(':bgnr', ':aunr')), component: AuftraegeStuecklisteVergleichComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebote.zusammenfassung(':bgnr', ':aunr')), component: AuftraegeZusammenfassungComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.angebote.bestaetigen(':bgnr', ':aunr')), component: AuftraegeBestaetigenComponent , canActivate: [AuthGuard] },

    // Bestellungen
    { path: getRoute(UtilUrl.bestellungen.bestellungen), component: BestellungenComponent, canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.bestellungen.leiterplatte(':bestellungID')), component: BaugruppenLeiterplatteComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.bestellungen.bom(':bestellungID')), component: AuftraegeStuecklisteComponent , canActivate: [AuthGuard] },
    
    /****************************************
     *** Unterlagen für Aufträge anzeigen ***
     ****************************************/
    { path: getRoute(UtilUrl.angebote.unterlagen(':bgnr', ':aunr')), component: UnterlagenComponent , canActivate: [AuthGuard] },
    { path: getRoute(UtilUrl.bestellungen.unterlagen(':bestellungID')), component: UnterlagenComponent , canActivate: [AuthGuard] },

    /****************************************
     *********** Bauteil Suche **************
     ****************************************/
    { path: getRoute(UtilUrl.bauteil_suche), component: BauteilSucheComponent , canActivate: [AuthGuard] },

    /****************************************
     ********* Checkout Ergebnis ************
     ****************************************/
    // Wenn der untere Route geändert wird, MUSS auch in PHP der "Erfolgreich" Redirect für Stripe angepasst werden
    { path: getRoute(UtilUrl.angebote.checkout.erfolgreich(':bgnr', ':aunr')), component: CheckoutErfolgreichComponent, canActivate: [AuthGuard] },

    /**************************************
     *************** Sonstiges ************
     *************************************/
    
    { path: getRoute(UtilUrl.fehlermeldungen), component: FensterFehlermeldungenComponent, canActivate: [AuthGuard] },
    
    { path: getRoute(UtilUrl.vorschlaege), component: VorschlaegeComponent, canActivate: [AuthGuard] },    // Vorschläge

    { path: getRoute(UtilUrl.unberechtigt), component: UnberechtigtComponent, canActivate: [AuthGuard]},
    
    { path: '**', redirectTo: getRoute(UtilUrl.menu) },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [
      //Keycloak_AuthGuard
    ]
})
export class AppRoutingModule {}
