import { BackendService } from "../services/backend.service";

export class UtilAngebotLoeschen {
  private static URLAusnahmen: string[] = [
    "vergleichen"
    ,"zusammenfassung"
    ,"bestaetigen"
  ]

  private static AusnahmeFuerURLs(url: string): boolean {
    return this.URLAusnahmen.includes(url);
  }

  public static AngebotSollGeloeschtWerden(backend: BackendService, url: string | null, aunr: any): Promise<boolean> { // Prüft, ob die bgnrkd bereits existiert
    const letztesUrlSplit = url?.split("/").pop();

    return new Promise((resolve, reject) => {
      if(url === null || url === undefined || url === "") {
        resolve(false);
      }else{
        const erg = this.AusnahmeFuerURLs(letztesUrlSplit ?? "")

        if(erg === false){
          let subscription1 = backend.AuftragIstBestellt(aunr).subscribe((value)=>{
            subscription1.unsubscribe();

            // True: Auftrag wurde bereits bestätigt
            // False: Auftrag wurde noch nicht bestätigt
            if(value){
              resolve(false);
            }else{
              // Wenn der Auftrag nicht bestätigt ist, dann lösche es
              let subscription2 = backend.DeleteAuftraeg(aunr).subscribe((value)=>{
                subscription2.unsubscribe();

                if(value !== false){
                  resolve(true)
                }else{
                  resolve(false)
                }
              }, (error)=>{
                console.error(error)
                resolve(false)
              })
            }
          })
        }else{
          resolve(false);
        }
      }
    });
  }

}
