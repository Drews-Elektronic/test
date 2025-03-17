import { MatDialog } from "@angular/material/dialog";
import { DialogComponent } from "../views/.children/dialog/dialog.component";
import { filter, tap } from "rxjs";
import { BackendService } from "../services/backend.service";

export class UtilStripe {
  public static checkout(backend: BackendService, dialog:MatDialog, aunr:any, auftrag: any, callback_bevor_checkout: Function, callback_nach_checkout: Function, callback_nach_fehler: Function = ()=>{}){
    if(auftrag.bestellt == 0){
      const dialogRefUebernahmeBeginnen = dialog.open(DialogComponent, {
        width: '400px',
        data: {
          titel: "Wollen Sie wirklich bestellen?",
          ja_button_content: "Ja",
          ja_button_style: "success",
          nein_button_exist_not: true
        }
      });
      
      // Dialogfenster Öffnen ---------------------------------------------------------------------
      let subscription1 = dialogRefUebernahmeBeginnen.afterClosed().pipe(
        filter((result: any) => result != undefined),   // Abbrechen
        tap((result: any) => {                          // ja: true; nein: false;
          subscription1.unsubscribe();

          if(result){
            callback_bevor_checkout();

            let subscription2 = backend
              .CheckOut(aunr)
              .subscribe((value: any)=>{
                subscription2.unsubscribe();

                callback_nach_checkout(value);
              },(error)=>{
                console.error(error)
                callback_nach_fehler()
              })
          }
        })
      ).subscribe();
    }
  }
}
