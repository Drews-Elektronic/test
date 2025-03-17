import { Injectable } from '@angular/core';

import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { MitteilungComponent } from '../views/.children/mitteilung/mitteilung.component';
import { filter, take, tap } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FehlermeldungdialogComponent } from '../views/.children/.fehlermeldung/fehlermeldungdialog/fehlermeldungdialog.component';

@Injectable({
  providedIn: 'root'
})
export class MitteilungService {
  private callbackAfterDismissed: Function =  ()=>{};
  private callbackOnAction: Function =  ()=>{};

  private snackBarRef: MatSnackBarRef<MitteilungComponent> | undefined;
  private matDialogRef: MatDialogRef<FehlermeldungdialogComponent> | undefined;

  constructor(
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ){}

  registerCallbackAfterDismissed(callback: Function) {
    this.callbackAfterDismissed = callback;
  }

  private triggerCallbackAfterDismissed(data: any = undefined) {
    if (this.callbackAfterDismissed) {
      this.callbackAfterDismissed(data);
    }
  }

  registerCallbackOnAction(callback: Function) {
    this.callbackOnAction = callback;
  }

  private triggerCallbackOnAction(data: any = undefined) {
    if (this.callbackOnAction) {
      this.callbackOnAction(data);
    }
  }

  createMessage(data: {message:string, todo?: string} | string, panelClass: string = "success", duration: number | undefined = undefined): any{
    let tmp_data;
    if(typeof data === "string"){
      tmp_data = { message: data} 
    }else{
      tmp_data = { 
        message: data.message,
        todo: data?.todo
      }
    }
    
    const snackBarRef = this._snackBar.openFromComponent(MitteilungComponent,
      {
        data: tmp_data,
        panelClass: "notification-" + panelClass, // CSS Styles befinden sich in 'styles.scss'
        duration: duration ? 1000 * duration : undefined,
        horizontalPosition: "right",
        verticalPosition: "top",
      }
    );

    if(this.callbackAfterDismissed){
      let subscribeAfterDismissed = snackBarRef.afterDismissed().subscribe((value)=>{
        subscribeAfterDismissed.unsubscribe();
        this.triggerCallbackAfterDismissed(value)
      })
    }
    
    if(this.callbackOnAction){
      let subscribedOnAction = snackBarRef.onAction().subscribe((value)=>{
        subscribedOnAction.unsubscribe();
        this.triggerCallbackOnAction(value)
      })
    }

    this.snackBarRef = snackBarRef;
  }

  closeMessage(){
    if(this.snackBarRef){
      this.snackBarRef.dismiss();
    }
  }

  closeMessageDialog(){
    if(this.matDialogRef){
      this.matDialogRef.close();
    }
  }

  createMessageDialog(content: {message:string, todo?: string} | string, title?: string){
    this.matDialogRef = this.dialog.open(FehlermeldungdialogComponent, {
      width: '600px',
      data: {
        titel: title,
        content: content
      }
    });
    
    this.matDialogRef.afterClosed().pipe(
      take(1),
      filter((result: any) => result != undefined),   // Abbrechen
      tap((result: any) => {                          // ja: true; nein: false;
        
      })
    )
  }
}
