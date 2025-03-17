import { Component } from '@angular/core';
import { Kunde } from 'src/app/interfaces/kunde';
import { BackendService } from 'src/app/services/backend.service';

import { MitteilungService } from 'src/app/services/mitteilung.service';

@Component({
  selector: 'mpl-kunden-uebersicht',
  templateUrl: './kunden-uebersicht.component.html',
  styleUrls: ['./kunden-uebersicht.component.scss']
})
export class KundenUebersichtComponent {
    kunden: any = [];

    constructor(
        private backend: BackendService,
        private mitteilungService: MitteilungService
    ) {}

    ngOnInit(): void {
        this.Get();
    }

    ngOnDestroy(): void {
        this.mitteilungService.closeMessage();
    }

    Get() {
        let subscription = this.backend.GetKunden().subscribe((value) => {
            // In diesem Projekt kommt die Fehlermeldung und Successmeldung Text aus PHP, aber 'Kunden' ist nur zum testen da, weshalb es durch Angular vorhanden ist.

            subscription.unsubscribe();
            if (value === false) {
                //! Fehlermeldung
                console.log('GetKunden Fehler');
                //this.mitteilungService.createMessage("Kunden konnten nicht geladen werden", "danger")
                this.mitteilungService.createMessageDialog("Kunden konnten nicht geladen werden")
            } else {
                this.kunden = value;
            }
        });
    }

    Update(kunde: Kunde) {
        let subscription = this.backend
            .UpdateKunde(kunde)
            .subscribe((value) => {
                // In diesem Projekt kommt die Fehlermeldung und Successmeldung Text aus PHP, aber 'Kunden' ist nur zum testen da, weshalb es durch Angular vorhanden ist.

                subscription.unsubscribe();
                if (value === false) {
                    //this.mitteilungService.createMessage("Kunde konnte nicht aktualisiert werden", "danger")
                    this.mitteilungService.createMessageDialog("Kunde konnte nicht aktualisiert werden")
                    //! Fehlermeldung
                    console.log('UpdateKunden Fehler');
                } else {
                    //this.mitteilungService.createMessage("Kunde wurde erfolgreich aktualisiert", "success")
                }
            });
    }

    Delete(kunde: Kunde) {
        let subscription = this.backend
            .DeleteKunde(kunde)
            .subscribe((value) => {
                // In diesem Projekt kommt die Fehlermeldung und Successmeldung Text aus PHP, aber 'Kunden' ist nur zum testen da, weshalb es durch Angular vorhanden ist.

                subscription.unsubscribe();
                if (value === false) {
                    //this.mitteilungService.createMessage("Kunde konnte nicht gel\u00F6scht werden", "danger")
                    this.mitteilungService.createMessageDialog("Kunde konnte nicht gel\u00F6scht werden")
                    //! Fehlermeldung
                    console.log('DeleteKunde Fehler');
                } else {
                    this.Get();
                    //this.mitteilungService.createMessage("Kunde wurde gel\u00F6scht", "success")
                }
            });
    }

    selectKdnr(kunde: Kunde){
        let subscription = this.backend
            .selectKundennr(kunde)
            .subscribe((value) => {
                // In diesem Projekt kommt die Fehlermeldung und Successmeldung Text aus PHP, aber 'Kunden' ist nur zum testen da, weshalb es durch Angular vorhanden ist.
                
                subscription.unsubscribe();
                if (value === false) {
                    //! Fehlermeldung
                    console.log('SelectKundennummer Fehler');
                    //this.mitteilungService.createMessage("Kundennummer konnte nicht übernommen werden", "danger")
                    this.mitteilungService.createMessageDialog("Kundennummer konnte nicht übernommen werden")
                } else {
                    this.backend.kundennummer = Number(value)
                }
            });
    }
}
