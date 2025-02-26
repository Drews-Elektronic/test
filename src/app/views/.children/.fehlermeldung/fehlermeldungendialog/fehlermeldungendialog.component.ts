import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mpl-fehlermeldungendialog',
  templateUrl: './fehlermeldungendialog.component.html',
  styleUrls: ['./fehlermeldungendialog.component.scss']
})
export class FehlermeldungenDialogComponent {
  title: string = "";
  columns: any[] = []
  displayedColumns: any[] = ['beschreibung'];
  dataSource: any[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {table: any, columns: {id:string, label:string}[], title?:string},
  ){}

  ngOnInit(){
    // Entnehme die Fehler
    this.dataSource = this.data.table
    
    this.columns = this.data.columns;
    this.displayedColumns = this.columns.map(c => c.id);
  }
  
}
