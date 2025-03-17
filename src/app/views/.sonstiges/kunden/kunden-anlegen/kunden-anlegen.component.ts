import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Kunde } from 'src/app/interfaces/kunde';
import { BackendService } from 'src/app/services/backend.service';

import { MitteilungService } from 'src/app/services/mitteilung.service';

import { Location } from '@angular/common';
import { UtilUrl } from 'src/app/utils/util.url';

@Component({
  selector: 'mpl-kunden-anlegen',
  templateUrl: './kunden-anlegen.component.html',
  styleUrls: ['./kunden-anlegen.component.scss']
})
export class KundenAnlegenComponent implements OnInit {
  title: string = "neuen Benutzer anlegen";
  /*
  form = new FormGroup({
    firma: new FormControl('', [Validators.required]),
    anrede: new FormControl('', [Validators.required]),
    vorname: new FormControl('', [Validators.required]),
    nachname: new FormControl('', [Validators.required]),
    strasse: new FormControl('', [Validators.required]),
    plz: new FormControl('', [Validators.required]),
    ort: new FormControl('', [Validators.required]),
    land: new FormControl('', [Validators.required]),
    mail: new FormControl('', [Validators.required]),
    tel: new FormControl('', [Validators.required]),
    lianrede: new FormControl('', [Validators.required]),
    livorname: new FormControl('', [Validators.required]),
    linachname: new FormControl('', [Validators.required]),
    listrasse: new FormControl('', [Validators.required]),
    liort: new FormControl('', [Validators.required]),
    liland: new FormControl('', [Validators.required]),
    limail: new FormControl('', [Validators.required]),
    litel: new FormControl('', [Validators.required]),
    reanrede: new FormControl('', [Validators.required]),
    revorname: new FormControl('', [Validators.required]),
    renachname: new FormControl('', [Validators.required]),
    restrasse: new FormControl('', [Validators.required]),
    replz: new FormControl('', [Validators.required]),
    reort: new FormControl('', [Validators.required]),
    reland: new FormControl('', [Validators.required]),
    remail: new FormControl('', [Validators.required]),
    retel: new FormControl('', [Validators.required]),
  });
  */

  form: Kunde = {kdnr: 0};
  getSuccess: boolean = false;
  updateSuccess: boolean = false;

  constructor(
    private backend: BackendService, 
    private router: Router,
    private mitteilungService: MitteilungService,
    private location: Location
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

  AddKunden() {
    let subscription = this.backend.AddKunden(this.form).subscribe((value) => {
      // In diesem Projekt kommt die Fehlermeldung und Successmeldung Text aus PHP, aber 'Kunden' ist nur zum testen da, weshalb es durch Angular vorhanden ist.
      
      subscription.unsubscribe();
      if (value === false) {
        //! Fehlermeldung
        console.log('Kunde anlegen Fehler');
        this.updateSuccess = false;
        //this.mitteilungService.createMessage("Kunde konnte nicht angelegt werden", "danger")
        this.mitteilungService.createMessageDialog("Kunde konnte nicht angelegt werden")
      } else {
        //this.mitteilungService.createMessage("Kunde wurde erfolgreich angelegt", "success")
        this.updateSuccess = true;

        this.router.navigate(UtilUrl.kunden.uebersicht)
      }
    });
  }

  zurueck(){
    this.location.back();
  }
}
