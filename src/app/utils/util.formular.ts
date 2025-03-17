import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

export class UtilFormular {

  constructor() {}

  public static findeZeileDurchObject(
    matTableDataSource: MatTableDataSource<any>
    , data: any
  ){
    const index = matTableDataSource.data.indexOf(data, 0);
    return index
  }

  public static loescheZeileDurchObject(matTableDataSource: MatTableDataSource<any>, data: any): void{
    const index = this.findeZeileDurchObject(matTableDataSource, data);
    if (index > -1) {
      matTableDataSource.data.splice(index, 1);
      matTableDataSource._updateChangeSubscription()
    }
  }

  public static loescheZeileDurchID(
    matTableDataSource: MatTableDataSource<any>
    , key:string
    , value: any
  ): void{
    const index = matTableDataSource.data.findIndex(element => element?.[key] === value);
    if (index > -1) {
      matTableDataSource.data.splice(index, 1);
      matTableDataSource._updateChangeSubscription()
    }
  }

  public static loopAngularMaterialTableSelection(
    selection: SelectionModel<any>
    , callback:Function
  ): Promise<any>{
    let promise_array: Promise<any>[] = []

    for (let index = 0; index < selection.selected.length; index++) {
      let element = selection.selected[index]
      
      promise_array.push(
        new Promise((resolve, reject)=>{
          callback(element, resolve, reject)
        })
      )
    }

    return Promise.all(promise_array)
  }

  public static resetAngularMaterialTableSelection(selection: SelectionModel<any>){

  }

  /** Ueberpruefe, ob alle Zeilen ausgewaehlt sind */
  public static isAllSelected(selection: any, length: number) {
    const numSelected = selection.selected.length;
    const numRows = length;
    
    return numSelected === numRows;
  }

  /** Alle Zeilen auswaehlen oder abwaehlen */
  public static toggleAllRows(selection: any, length: number, selectedBauteile: MatTableDataSource<any>) {
      if (this.isAllSelected(selection, length)) {
        selection.clear();
        return;
      }

      selection.select(...selectedBauteile.data);
  }

}
