import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { from, lastValueFrom, Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';

import { KeycloakService } from 'keycloak-angular';

import { MitteilungService } from 'src/app/services/mitteilung.service';

import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { UtilUrl } from '../utils/util.url';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private mitteilungService: MitteilungService,
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const viewaction: any = request.body && (request.body as FormData).get('viewaction');
     
    return from(this.handle(request, next, viewaction))
  }

  private async promise(){
    return new Promise(async (resolve, reject)=>{
      if(!environment.keycloak_deaktivieren){
        if(this.keycloakService){
          let isExpired = this.keycloakService.isTokenExpired(1800) // Wenn der Token in 30 min abläuft, updaten 
          if(isExpired) {
            await this.keycloakService.updateToken(-1).catch((error)=> {throw error})
          }
        }
      }
      
      resolve(true)
    })
  } 

  private observer(tmp_request: HttpRequest<unknown>, tmp_next: HttpHandler, viewaction: any){
    return tmp_next.handle(tmp_request).pipe(
      take(2), // aus irgend einen Grund versendet Angular mehrere Anfragen nach PHP
      tap((value:any) => {
        if(value.type != 0 && value.body){
          if(!value.body.success){
            if(!environment.production){
              console.log(value.body);
            }else{
              console.log(value.body);
            }
            
            switch(value?.body?.message?.code){
              case 401:
                this.keycloakService.clearToken();
                this.keycloakService.login({
                  redirectUri: environment.protocol + environment.homeUrl + environment.mplUrl + this.router.routerState.snapshot.url
                })
                
                return;
                break;
              case 403:
                this.router.navigate(UtilUrl.unberechtigt)
                break;
            }

            // viewaction if's sind Ausnahmen, die eventuell besser in PHP gelöst werden sollten.
            // Aber aus Zeitdruck zurzeit hier implementiert werden.
            if((viewaction == "auftraege:quellenaktnew" || viewaction == "auftraege:quellenakt") && value.body.message){
              // Siehe im 'backend.service.ts' in der Funktion 'QuellenAktualisieren'
            } else if(value.body.message){
              let data: {message: string, todo?: string}

              data = { 
                message: value.body.message.notification
              };
              if(value.body.message.todo){
                data.todo = value.body.message.todo;
              }
              this.mitteilungService.createMessage(data , "warning")
            } else{
              console.log("Error: Unerwarteter Fehler")
              //this.mitteilungService.createMessage("Unerwarteter Fehler" , "danger")
              this.mitteilungService.createMessageDialog("Unerwarteter Fehler")
            }
          }
        }
      }
      , (error:any)=>{ // Der Status code ist immer 200. Weshalb alles im oberen Abschnitt ist.
        console.error(error)

        const statusCodeInMessage = error.status;
        switch(statusCodeInMessage){
          case 401:
            this.keycloakService.clearToken();
            this.keycloakService.login()            
            break;
        }
      })
    );
  }

  public async handle(tmp_req: HttpRequest<any>, tmp_next: HttpHandler, viewaction: any){
    await this.promise()

    return lastValueFrom(this.observer(tmp_req, tmp_next, viewaction))
  }
}
