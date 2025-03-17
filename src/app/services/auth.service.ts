import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

import { MitteilungService } from 'src/app/services/mitteilung.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private mitteilungService: MitteilungService
  ) { }

  checkToken(){
    /*
    const reset = ()=>{
      localStorage.removeItem("token")
      localStorage.removeItem("timestamp")
      localStorage.removeItem("kdnr")

      setTimeout(()=>{
        window.location.href = environment.wordpressLoginUrl;
      }, 2000)
    }

    const wordpressToken = localStorage.getItem("token")
    const timestamp_raw  = localStorage.getItem("timestamp")
    const kdnr           = localStorage.getItem("kdnr")

    var timestamp
    if(timestamp_raw){
      timestamp = parseInt(timestamp_raw)
    }else{
      timestamp = 0
    }

    if(!wordpressToken || wordpressToken == null || wordpressToken == "" || !kdnr || kdnr == null || kdnr == "" ){
      this.mitteilungService.createMessage("Sie sind nicht angemeldet! Sie werden zum Login weitergeleitet", "warning")

      reset()

      return false
    }

    if (!timestamp || !(timestamp < (Date.now() /1000) - 60 * 60 * 24) ) { //PHP Timestamp ist in Sekunden und Angulars sind in Millisekunden 
      this.mitteilungService.createMessage("Ihre Sitzung ist abgelaufen! Sie müssen sich erneut anmelden", "warning")
      
      reset()

      return false
    }
    */

    return true
  }
}
