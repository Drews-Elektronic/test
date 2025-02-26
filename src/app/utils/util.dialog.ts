import { MatDialog } from "@angular/material/dialog";
import { take, tap } from "rxjs";
import { DialogComponent } from "../views/.children/dialog/dialog.component";

export class UtilDialog {

  public static loeschenBestaetigen(
    dialog: MatDialog,
    titel: string, 
    content: string
  ): Promise<any> {
    return new Promise((resolve, reject)=>{
      const dialogRef = dialog.open(DialogComponent, {
        width: '500px',
        data: {
          titel: titel,
          content: content,
          ja_button_content: "löschen",
          ja_button_style: "success",
          nein_button_exist_not: true
        }
      });

      let subscription1 = dialogRef.afterClosed().pipe(
          take(1),
          tap((value: any) => {                          // ja: true; nein: false; abbrechen: undefined
              subscription1.unsubscribe();
              if(value){
                resolve(true)
              }
          })
      ).subscribe();
    })
  }

}
