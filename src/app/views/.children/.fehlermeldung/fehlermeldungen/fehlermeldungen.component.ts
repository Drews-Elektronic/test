import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mpl-fehlermeldungen',
  templateUrl: './fehlermeldungen.component.html',
  styleUrls: ['./fehlermeldungen.component.scss']
})
export class FehlermeldungenComponent {
  title: string = "";
  columns: any[] = []
  displayedColumns: any[] = ['beschreibung'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource()

  @Input() data?: {table: any, columns: {id:string, label:string}[], title?:string}

  constructor(){}

  ngOnInit(){}
  
  ngOnChanges(){
    // Entnehme die Fehler
    this.dataSource = new MatTableDataSource(this.data?.table ?? []); 
    this.dataSource._updateChangeSubscription();

    this.columns = this.data?.columns ?? [];
    this.displayedColumns = this.columns.map(c => c.id);

    this.title = this.data?.title ?? "";
  }

}
