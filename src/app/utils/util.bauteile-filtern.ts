import { Beistellung } from "../enum/beistellung";
import { QuellenStatus } from "../enum/quellen-status";

export class UtilBauteileFiltern {
  public static komprimierte_bauteile(bauteile: any[]){
    return bauteile.filter((tmp_value: any) => tmp_value?.komprimierung == 1);
  }

  public static verfuegbare_bauteile(bauteile: any[]){
    return bauteile.filter((tmp_value: any) => tmp_value?.maxlbverfuegbar == QuellenStatus.VERFUEGBAR || tmp_value?.maxlbverfuegbar == QuellenStatus.VERFUEGBAR_IN || tmp_value?.maxlbverfuegbar == QuellenStatus.ALTERNATIVE_VERFUEGBAR || tmp_value?.maxlbverfuegbar == QuellenStatus.ALTERNATIVE_VERFUEGBAR_IN);
  }

  public static nicht_verfuegbare_bauteile(bauteile: any[]){
    return bauteile.filter((tmp_value: any) => tmp_value?.maxlbverfuegbar == QuellenStatus.NICHT_VERFUEGBAR || tmp_value?.maxlbverfuegbar == QuellenStatus.ALTERNATIVE_NICHT_VERFUEGBAR);
  }

  public static beistellungen(bauteile: any[]){
    return bauteile.filter((tmp_value: any) => tmp_value?.agbskd == Beistellung.BEISTELLUNG && tmp_value?.agbskd == Beistellung.BEISTELLUNG_DURCH_FEHLER)
  }

  public static nicht_bestueckte_bauteile(bauteile: any[]){
    return bauteile.filter((tmp_value: any) => tmp_value?.agbskd == Beistellung.NICHT_BESTUECKEN);
  }

  private static top_5_bauteile(bauteile: any[], key: string | number, return_id?: boolean|string|number){
    const tmp_object = bauteile
      .sort((a: any, b: any) => b[key] - a[key])
      .slice(0, 5); 

    const tmp_array: number[] = []

    for (const key in tmp_object) {
      if (Object.prototype.hasOwnProperty.call(tmp_object, key)) {
        const element = tmp_object[key];
        
        if(return_id === false){
          tmp_array.push(element);
        }else if(typeof return_id === "string" || typeof return_id === "number"){
          tmp_array.push(element[return_id]);
        }else{
          tmp_array.push(element.btnr);
        }
      }
    }

    return tmp_array
  }

  public static top_5_bauteile_laengsten_lieferzeiten(bauteile: any[]){
    return this.top_5_bauteile(bauteile, 'lieferZeit')
  }

  public static top_5_bauteile_teuersten_bauteile(bauteile: any[]){
    return this.top_5_bauteile(bauteile, 'betragbeschaffungsmenge')
  }

  public static auftrags_top_5_bauteile_laengsten_lieferzeiten(bauteile: any[]){
    return this.top_5_bauteile(bauteile, 'lieferZeit', false)
  }

  public static auftrags_top_5_bauteile_teuersten_bauteile(bauteile: any[]){
    return this.top_5_bauteile(bauteile, 'betragbeschaffungsmenge', false)
  }
}
