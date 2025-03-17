// Angular Module
import { APP_INITIALIZER, NgModule, Pipe } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

// PDF
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

//#region Localize
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe, 'de-DE');
//#endregion

// Angular Material Module
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import {
  MatSnackBarModule,
  MatSnackBarLabel,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarContainer
} from '@angular/material/snack-bar';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

// Angular Material Design anpassen
import { MatPaginatorIntlAnpassen } from './views/styles/angular-material/mat-paginatorintl-anpassen';

// PrimeNG Module
import { FileUploadModule   } from 'primeng/fileupload';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { TimelineModule } from 'primeng/timeline';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Services
import { WindowService } from './services/window.service';
import { LeererService } from './services/leerer.service';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './views/.layout/header/header.component';
import { FooterComponent } from './views/.layout/footer/footer.component';
import { ViewMenuComponent } from './views/view-menu/view-menu.component';
import { BaugruppenComponent } from './views/.formulare/baugruppen/baugruppen.component';
import { BaugruppenLeiterplatteComponent } from './views/.formulare/baugruppen/baugruppen-leiterplatte/baugruppen-leiterplatte.component';
import { AuftraegeComponent } from './views/.formulare/auftraege/auftraege.component';
import { KundendatenComponent } from './views/kundendaten/kundendaten.component';
import { BauteileComponent } from './views/.formulare/bauteile/bauteile.component';
import { BaugruppenStuecklisteComponent } from './views/.formulare/baugruppen/baugruppen-stueckliste/baugruppen-stueckliste.component';
import { BauteileAnlegenComponent } from './views/.formulare/bauteile/bauteile-anlegen/bauteile-anlegen.component';
import { BaugruppenAnlegenComponent } from './views/.formulare/baugruppen/baugruppen-anlegen/baugruppen-anlegen.component';
import { KundenUebersichtComponent } from './views/.sonstiges/kunden/kunden-uebersicht.component';
import { KundenAnlegenComponent } from './views/.sonstiges/kunden/kunden-anlegen/kunden-anlegen.component';
import { AuftraegeAnlegen2Component } from './views/.formulare/auftraege/auftraege-anlegen/auftraege-anlegen.component';
import { VorschlaegeComponent } from './views/.sonstiges/vorschlaege/vorschlaege.component';
import { LoginComponent } from './views/.sonstiges/login/login.component';
import { ImportBauteileTabelleComponent } from './views/.formulare/import/import-bauteile-tabelle.component';
import { ImportBauteilAnlegenComponent } from './views/.formulare/import/import-bauteil-anlegen/import-bauteil-anlegen.component';
import { AuftraegeStuecklisteComponent } from './views/.formulare/auftraege/auftraege-stueckliste/auftraege-stueckliste.component';
import { UnterlagenComponent } from './views/.formulare/unterlagen/unterlagen.component';
import { ImportBauteileKonfiguratorComponent } from './views/.formulare/import/import-bauteile-konfigurator/import-bauteile-konfigurator.component';
import { AlternativesBauteilSuchenComponent } from './views/.formulare/alternatives-bauteil-suchen/alternatives-bauteil-suchen.component';
import { NeuesProjektAnlegenComponent } from './views/.formulare/kanalisierung/neues-projekt-anlegen/neues-projekt-anlegen.component';
import { AuftraegeStuecklisteVergleichComponent } from './views/.formulare/auftraege/auftraege-stueckliste-vergleich/auftraege-stueckliste-vergleich.component';
import { AuftraegeZusammenfassungComponent } from './views/.formulare/auftraege/auftraege-zusammenfassung/auftraege-zusammenfassung.component';
import { NeuerAuftragAnlegenComponent } from './views/.formulare/kanalisierung/neuer-auftrag-anlegen/neuer-auftrag-anlegen.component';
import { AuftraegeBestaetigenComponent } from './views/.formulare/auftraege/auftraege-bestaetigen/auftraege-bestaetigen.component';
import { BestellungenComponent } from 'src/app/views/.formulare/bestellungen/bestellungen.component';
import { CheckoutErfolgreichComponent } from './views/.formulare/checkout/checkout-erfolgreich/checkout-erfolgreich.component';

// Children Components
import { MitteilungComponent } from './views/.children/mitteilung/mitteilung.component';
import { TabelleComponent } from './views/.children/tabelle/tabelle.component';
import { FormularHeaderComponent } from './views/.children/formular-header/formular-header.component';
import { FehlermeldungenComponent } from './views/.children/.fehlermeldung/fehlermeldungen/fehlermeldungen.component';
import { FensterFehlermeldungenComponent } from './views/.children/.fehlermeldung/fenster_fehlermeldungen/fensterfehlermeldungen.component'; 
import { AlternativesBauteilBearbeitenComponent } from './views/.children/alternatives-bauteil-bearbeiten/alternatives-bauteil-bearbeiten.component';
import { NavigationComponent } from './views/.children/navigation/navigation.component';
import { LadebalkenComponent } from './views/.children/ladebalken/ladebalken.component';
import { GlobaleBauteilSuche } from './views/.children/.suche/globale-bauteil-suche/globale-bauteil-suche.component';
import { ErgebnisTabelleComponent } from './views/.children/.suche/ergebnis-tabelle/ergebnis-tabelle.component';
import { PdfViewerComponent } from './views/.children/pdf-viewer/pdf-viewer.component';

// Children Formular Components
import { GrosserSpinnerComponent } from 'src/app/views/.children/grosser-spinner/grosser-spinner.component';
import { ButtonFileuploadComponent } from 'src/app/views/.children/.formular/button-fileupload/button-fileupload.component';
import { PfeilLinksComponent } from './views/.children/.formular/pfeil-links/pfeil-links.component';
import { PfeilRechtsComponent } from './views/.children/.formular/pfeil-rechts/pfeil-rechts.component';
import { ButtonCloseComponent } from './views/.children/.formular/button-close/button-close.component';
import { BomTabelleComponent } from './views/.children/.formular/bom-tabelle/bom-tabelle.component';
import { CountdownTimerComponent } from './views/.children/.formular/countdown-timer/countdown-timer.component';
import { BauteilSucheComponent } from './views/.formulare/bauteil-suche/bauteil-suche.component';
import { LeiterplatteBeigestelltComponent } from './views/.children/leiterplatte-beigestellt/leiterplatte-beigestellt.component';

// Dialog Component
import { DialogComponent } from './views/.children/dialog/dialog.component';
import { FehlermeldungenDialogComponent } from './views/.children/.fehlermeldung/fehlermeldungendialog/fehlermeldungendialog.component'; 
import { NeuesProjektDialogComponent } from './views/.formulare/kanalisierung/neues-projekt-anlegen/neues-projekt-dialog/neues-projekt-dialog.component';
import { NeuerAuftragDialogComponent } from './views/.formulare/kanalisierung/neuer-auftrag-anlegen/neuer-auftrag-dialog/neuer-auftrag-dialog.component';
import { CheckoutErfolgreichDialogComponent } from './views/.formulare/checkout/checkout-erfolgreich/checkout-erfolgreich-dialog/checkout-erfolgreich-dialog.component';
import { LeiterplatteBeistellenDialogComponent } from './views/.children/.dialog/leiterplatte-beistellen-dialog/leiterplatte-beistellen-dialog.component';
import { ActionButtonComponent } from './views/view-menu/action-button/action-button.component';

// Directives
import { AuftraegeStuecklisteVergleichDirective } from './directive/auftraege-stueckliste-vergleich.directive';

// KeyCloak
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

// sonstiges
import { environment } from 'src/environments/environment';

// Kann später entfernt werden
import { OldHeaderComponent } from './views/.layout/old-header/old-header.component';
import { FehlermeldungdialogComponent } from './views/.children/.fehlermeldung/fehlermeldungdialog/fehlermeldungdialog.component';

// Unsortierte
import { BestellungenBomComponent } from './views/.formulare/bestellungen/bestellungen-bom/bestellungen-bom.component';

function initializeKeycloak(keycloak: KeycloakService, router: Router) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.protocol + environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
        environment.protocol + environment.homeUrl + environment.mplUrl + '/assets/keycloak/silent-check-sso.html'
      }
    }).then((authenticated) => {
      if(authenticated !== true){
        keycloak.login({
          redirectUri: environment.protocol + environment.homeUrl + environment.mplUrl + router.url
        });
      }
    },(error)=>{
      console.error(error)
      
      keycloak.logout( environment.protocol + environment.homeUrl + environment.mplUrl )
    });
}

@NgModule({
  declarations: [
    // Komponenten
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ViewMenuComponent,
    BaugruppenComponent,
    BaugruppenLeiterplatteComponent,
    AuftraegeComponent,
    KundendatenComponent,
    BauteileComponent,
    BaugruppenStuecklisteComponent,
    BauteileAnlegenComponent,
    BaugruppenAnlegenComponent,
    KundenUebersichtComponent,
    KundenAnlegenComponent,
    AuftraegeAnlegen2Component,
    VorschlaegeComponent,
    LoginComponent,
    ImportBauteileTabelleComponent,
    ImportBauteilAnlegenComponent,
    AuftraegeStuecklisteComponent,
    UnterlagenComponent,
    ImportBauteileKonfiguratorComponent,
    NeuesProjektAnlegenComponent,
    AuftraegeStuecklisteVergleichComponent,
    AuftraegeZusammenfassungComponent,
    NeuerAuftragAnlegenComponent,
    AuftraegeBestaetigenComponent,
    BestellungenComponent,
    BauteilSucheComponent,
    CheckoutErfolgreichComponent,

    // Children
    ButtonFileuploadComponent,
    GlobaleBauteilSuche,
    ErgebnisTabelleComponent,
    GrosserSpinnerComponent,
    PdfViewerComponent,
    LeiterplatteBeigestelltComponent,
    LadebalkenComponent,
    NavigationComponent,
    AlternativesBauteilSuchenComponent,
    AlternativesBauteilBearbeitenComponent,
    FensterFehlermeldungenComponent,
    FehlermeldungenDialogComponent,
    FehlermeldungenComponent,
    DialogComponent,
    MitteilungComponent,
    TabelleComponent,
    FormularHeaderComponent,
    NeuesProjektDialogComponent,
    NeuerAuftragDialogComponent,
    ActionButtonComponent,
    FehlermeldungdialogComponent,
    PfeilLinksComponent,
    PfeilRechtsComponent,

    // Directive
    AuftraegeStuecklisteVergleichDirective,
    
    //Neue unsortierte Kompoente
    /* Kann später entfernt werden */ OldHeaderComponent,
          CheckoutErfolgreichDialogComponent,
          ButtonCloseComponent,
          LeiterplatteBeistellenDialogComponent,
          BomTabelleComponent,
          BestellungenBomComponent,
          CountdownTimerComponent,
          
  ],
  imports: [
    // Angular
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    
    // Angular Material
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSortModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSnackBarLabel,
    MatSnackBarAction,
    MatSnackBarActions,
    CdkDrag,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatStepperModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatCardModule,

    // PrimeNG
    FileUploadModule,
    OverlayPanelModule,
    MenuModule,
    TimelineModule,

    // KeyCloak
    KeycloakAngularModule,

    //PDF
    NgxExtendedPdfViewerModule
  ],
  providers: [
    // KeyCloak
    environment.keycloak_deaktivieren ? LeererService : {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, Router]
    },

    environment.keycloak_deaktivieren ? LeererService : {
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true
    },
    
    // Error Handling
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: ErrorInterceptor, 
      multi: true 
    },
    
    // Um ein neues Fenster zu öffnen
    // Wird zurzeit nicht mehr benötigt
    WindowService,
    { provide: 'windowObject', useValue: window },

    // Angular Material
    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlAnpassen},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
