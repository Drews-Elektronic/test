import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { DataTransferService } from 'src/app/services/data-transfer.service';
import { Baugruppe } from 'src/app/interfaces/baugruppe';

import { MitteilungService } from 'src/app/services/mitteilung.service';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-baugruppen-anlegen',
  templateUrl: './baugruppen-anlegen.component.html',
  styleUrls: ['./baugruppen-anlegen.component.scss']
})
export class BaugruppenAnlegenComponent {
  baugruppe: any = {
    id: 0,
    bgbezeichnungkd: '',
    revision: 'Version 1',
    bgnrkd: '',
    lpbtnrkd: ''
  };

  // In Zukünft sollen die Variablen aus einer Datenbank entnommen werden
  statuslp: any = [
    {
      value: "1",
      name: "Noch nicht angelegt",
      selected: true
    },
    {
      value: "2",
      name: "In Bearbeitung"
    },
    {
      value: "3",
      name: "Vollständig"
    },
    {
      value: "4",
      name: "In Prüfung"
    },
    {
      value: "5",
      name: "Geprüft und OK"
    },
  ]
  statussl: any = [
    {
      value: "1",
      name: "Noch nicht angelegt",
      selected: true
    },
    {
      value: "2",
      name: "In Bearbeitung"
    },
    {
      value: "3",
      name: "In Prüfung"
    },
    {
      value: "4",
      name: "Geprüft"
    },
    {
      value: "5",
      name: "Vollständig"
    }
  ]

  bauteile: any[] = [];

  constructor(
    private backend: BackendService,
    private dataTransfer: DataTransferService,
    private router: Router,
    private mitteilungService: MitteilungService
  ) { }

  ngOnInit(): void {
    this.GetFormFields();
    this.GetBauteile();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  BaugruppeAnlegen() {
    let subscription = this.backend
      .AddBaugruppe(this.baugruppe)
      .subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.dataTransfer.Data = value;
          this.router.navigate(UtilUrl.baugruppen.baugruppen)

          //this.mitteilungService.createMessage("Baugruppe wurde erfolgreich angelegt", "success")
        }
      });
  }

  GetFormFields() {
    let subscription = this.backend.GetFormFields("MPLBauteilPoolZeile").subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        /*console.log("value")
        console.log(value)

        this.statuslp = value.statuslp
        this.statussl = value.statuss1
        */
      }
    });
  }

  GetBauteile() {
    let subscription = this.backend.GetBauteile().subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.bauteile = value;
      }
    });
  }

}
