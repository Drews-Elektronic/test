import { Component, Inject } from '@angular/core';

import { WindowService } from 'src/app/services/window.service';
import { MitteilungService } from 'src/app/services/mitteilung.service'; 

import { DOCUMENT } from '@angular/common';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'mpl-fensterfehlermeldungen',
  templateUrl: './fensterfehlermeldungen.component.html',
  styleUrls: ['./fensterfehlermeldungen.component.scss']
})
export class FensterFehlermeldungenComponent {
  title: string = "";
  columns: any[] = []
  displayedColumns: any[] = ['beschreibung'];
  dataSource: any[] = []

  htmlElement: any;
  
  constructor(
    private windows: WindowService,
    private mitteilungService: MitteilungService,
    @Inject(DOCUMENT) private document: Document
  ){}

  ngOnInit(){
    this.removeHeader()

    // Entnehme die Fehler aus dem Service und bereite diese jeweils für die Tabelle, bzw. den dataSource vor.
    let raw_data = this.windows.getFehlermeldungen()
    
    this.title = raw_data[0] ?? ""

    this.dataSource = raw_data[1]
    
    this.columns = raw_data[2];
    this.displayedColumns = this.columns.map(c => c.id);
  }

  ngOnDestroy(){
    this.addHeader()
  }

  //#region HTML Header entfernen
  removeHeader() {
    // finde alle <header>
    const header_htmlElement = this.document.querySelectorAll('header')
    let tmp_htmlElement: any;
    for (let index = 0; index < header_htmlElement.length; index++) {
      // finde suche von allen <header>, einen <header> mit der id 'header-verstecken'
      tmp_htmlElement = header_htmlElement[index]
      let id = tmp_htmlElement.getAttribute('id');
      if(id === 'header-verstecken'){
        break;
      }
    }

    if(tmp_htmlElement){
      this.htmlElement = tmp_htmlElement;

      // Add a CSS class to the <html> element
      this.htmlElement.classList.add('header-verstecken');
    }else{
      //this.mitteilungService.createMessage({message:"Der Header konnte nicht gefunden werden", todo:"Bitte melden sie die Fehlermeldung dem IT-Support"}, "danger");
      this.mitteilungService.createMessageDialog({message:"Der Header konnte nicht gefunden werden", todo:"Bitte melden sie die Fehlermeldung dem IT-Support"});
    }
  }

  addHeader() {
    // remove a CSS class to the <html> element
    this.htmlElement.classList.remove('header-verstecken');
  }
  //#endregion
}
