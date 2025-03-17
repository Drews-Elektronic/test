import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { Auftrag } from 'src/app/interfaces/auftrag';
import { Baugruppe } from 'src/app/interfaces/baugruppe';

import { BackendService } from 'src/app/services/backend.service';
import { DataTransferService } from 'src/app/services/data-transfer.service';

import { MitteilungService } from 'src/app/services/mitteilung.service';

import { Location } from '@angular/common';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-auftraege-anlegen',
  templateUrl: './auftraege-anlegen.component.html',
  styleUrls: ['./auftraege-anlegen.component.scss']
})
export class AuftraegeAnlegen2Component {
  auftrag: any = {
    id: 0,
    baugruppe: { bgnr: 0, bgnrkd: '', bgbezeichnungkd: '', revision: 'Version 1' },
    auftragsmenge: 1,
    auftragsart: '',
    wunschtermin: '',
    aubemerkungkd: '',
  };

  baugruppen: any[] = []
  kbauftragsart: any[] = []
  kbwunschtermin: any[] = []

  formated_kbauftragsart : any[] = []
  formated_kbwunschtermin: any[] = []

  slpositionen: number | undefined;

  constructor(
    private backend: BackendService,
    private dataTransfer: DataTransferService,
    private router: Router,
    private mitteilungService: MitteilungService,
    private location: Location
  ) {}

  ngOnInit(){
    this.GetBaugruppen();
    this.GetFormFields();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  //#region Get
  GetBaugruppen(): void {
    let subscription = this.backend.GetBaugruppen().subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
          this.baugruppen = value;
      }
    });
  }
  GetFormFields(){
    let subscription = this.backend.GetFormFields("MPLAuftraege").subscribe((value) => {
        subscription.unsubscribe();
        if (value !== false) {
          this.kbauftragsart = value.auftragsart
          this.kbwunschtermin = value.wunschtermin

          let tmp_auftragsart: any = {}
          value.auftragsart?.forEach((x: any) => {
            tmp_auftragsart[x.value] = {
              name: x.name,
              sort: x.sort,
              sprache: x.sprache,
              standard: x.standard
            };
          });
          this.formated_kbauftragsart = tmp_auftragsart

          let tmp_wunschtermin: any = {}
          value.wunschtermin?.forEach((x: any) => {
            tmp_wunschtermin[x.value] = {
              name: x.name,
              sort: x.sort,
              sprache: x.sprache,
              standard: x.standard
            }
          });
          this.formated_kbwunschtermin = tmp_wunschtermin
        }
    });
  }
  //#endregion
  //#region anlegen
  ProjektAnlegen() {
    let subscription = this.backend.AddAuftrag(this.auftrag).subscribe((value) => {
      subscription.unsubscribe();
      if (value !== false) {
        this.dataTransfer.Data = value;
        this.router.navigate(UtilUrl.angebote.angebote)
      }
    });
  }
  //#endregion
  //#region sonstiges
  setBGNRKD(event: any){
    // finde die ausgewählte Baugruppe durch bgnrkd
    let indexBaugruppe = this.baugruppen.findIndex(x => x.bgnr == event.target.value)
    let ausgewaehlteBaugruppe = this.baugruppen[indexBaugruppe]
    
    // ändere die zu verändernden Auftrag mit dem ausgewählten Baugruppe
    this.auftrag.baugruppe.bgnr = ausgewaehlteBaugruppe?.bgnr
    this.auftrag.baugruppe.bgnrkd = ausgewaehlteBaugruppe?.bgnrkd
    this.auftrag.baugruppe.bgbezeichnungkd = ausgewaehlteBaugruppe?.bgbezeichnungkd
    this.slpositionen = ausgewaehlteBaugruppe?.slpositionen
  }

  zurueck(){
    this.router.navigate(UtilUrl.angebote.angebote)
  }
  //#endregion
}
