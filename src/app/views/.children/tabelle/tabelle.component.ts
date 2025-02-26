import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectorRef 
} from '@angular/core';

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-tabelle',
  templateUrl: './tabelle.component.html',
  styleUrl: './tabelle.component.scss'
})
export class TabelleComponent {

  @Input() button_name: string = "";
  @Input() dataSource: any;
  @Input() columns: any[] = [];
  displayedColumns: any[] = [];

  @Input() sort_column: any;

  // Button anzeigen
  @Input() functions: boolean = true;
  @Input() delete_function: boolean = true;
  @Input() auftrag_function: boolean = true;
  

  @Output() create = new EventEmitter<boolean>();
  @Output() update = new EventEmitter<boolean>();
  @Output() delete = new EventEmitter<number>();


  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  @Input() ausgewaehlt: number | undefined;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(){
    this.displayedColumns = this.columns.map(c => c.columnDef);

    if(this.functions && this.displayedColumns.length>0){
      
      if(this.delete_function){
        this.displayedColumns = this.displayedColumns.concat(['delete']);
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

      if(this.sort_column){
        this.dataSource.sort.sort({ id: this.sort_column, start: 'asc', disableClear: false });
        this.cdr.detectChanges();
      }
  }

  //#region Get

  //#endregion
  //#region Add, Update, Delete
  Create(){
    this.create.emit(true);
  }
  Update(id: any){
    this.update.emit(id);
  }
  Delete(id: any){
    this.delete.emit(id);
  }
  //#endregion
  //#region Sonstiges
  filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  //#endregion
}