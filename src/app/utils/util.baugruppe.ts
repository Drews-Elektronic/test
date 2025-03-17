import { BackendService } from "../services/backend.service";

export class UtilBaugruppe {
  public static pruefeBgnrkd(backend: BackendService, bgnrkd: string | null): Promise<boolean> { // Prüft, ob die bgnrkd bereits existiert
    return new Promise((resolve, reject) => {
      if(bgnrkd === null || bgnrkd === undefined || bgnrkd === "") {
        resolve(false);
      }else{
        backend.bgnrkdpruefen(bgnrkd)
          .subscribe((value) => {
            if (value !== null) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
      }
    });
  }
}
