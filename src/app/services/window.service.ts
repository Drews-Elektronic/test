import { Injectable, Inject } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { FehlermeldungenDialogComponent } from '../views/.children/.fehlermeldung/fehlermeldungendialog/fehlermeldungendialog.component';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private storagetitle = 'title';
  private storageKey1 = 'fehlermeldungen';
  private storageKey2 = 'colums_fehlermeldungen';

  private static openFehlermeldungen_fenster: any[] = []
  private static openFehlermeldungen_dialog: any[]  = []
 
  constructor(
    private dialog: MatDialog,
    @Inject('windowObject') private window: Window
  ) {}

  // Funktioniert, sodass wenn die Funktion ausgeführt wird, das neue Fenster im Vordergrund ist, 
  // ABER es kann nicht mit 'blur' automatisch ausgeführt werden.
  // Andere Lösungen es auszuführen, wäre für die UX schädlich
  static focusFehlermeldungsFenster(){ 
    WindowService.openFehlermeldungen_fenster.forEach((fenster: any) => {
      fenster.focus()
    });
  }

  setFehlermeldungen(tmp_data: any, colums: {id:string, label:string}[] = [{id:"beschreibung", label:"Beschreibung"}], title?: string){
    if(title){
      localStorage.setItem(this.storagetitle, title);
    }else{
      localStorage.removeItem(this.storagetitle);
    }
    localStorage.setItem(this.storageKey1, JSON.stringify(tmp_data));
    localStorage.setItem(this.storageKey2, JSON.stringify(colums));
  }

  getFehlermeldungen(){
    const storedTitle = localStorage.getItem(this.storagetitle);
    const storedData1 = localStorage.getItem(this.storageKey1);
    const storedData2 = localStorage.getItem(this.storageKey2);
    return [ 
      storedTitle ? storedTitle : undefined,
      storedData1 ? JSON.parse(storedData1) : undefined,
      storedData2 ? JSON.parse(storedData2) : undefined
    ];
  }

  static closeFehlermeldungen(){
    WindowService.openFehlermeldungen_fenster.forEach((fenster: any) => {
      fenster.close()
    });
    WindowService.openFehlermeldungen_dialog.forEach((dialog: any) => {
      dialog.close()
    });
  }

  openFehlerMeldungen(){
    let newWindow: any
    if(environment.production){
      newWindow = this.window.open(environment.protocol + environment.homeUrl + environment.mplUrl + "/fehlermeldungen", "Fehlermeldungen", 'width=600,height=400')
      WindowService.openFehlermeldungen_fenster.push(newWindow);
    }else{
      newWindow = this.window.open(environment.protocol + environment.homeUrl + "/fehlermeldungen", "Fehlermeldungen", 'width=600,height=400')
      WindowService.openFehlermeldungen_fenster.push(newWindow);
    }
  }

  openFehlerMeldungenDialogDurchLocalStorage(){
    const data: any = this.getFehlermeldungen()
    WindowService.openFehlermeldungen_dialog.push(this.dialog.open(FehlermeldungenDialogComponent, {
      disableClose: true,
      hasBackdrop: false,
      data:{
        title: data[0],
        table: data[1],
        columns: data[2]
      }
    }))
  }

  openFehlerMeldungenDialog(table: any, columns: {id:string, label:string}[] = [{id:"beschreibung", label:"Beschreibung"}], title?:string){
    WindowService.openFehlermeldungen_dialog.push(this.dialog.open(FehlermeldungenDialogComponent, {
      disableClose: true,
      hasBackdrop: false,
      data:{
        title: title,
        table: table,
        columns: columns
      }
    }))
  }
}