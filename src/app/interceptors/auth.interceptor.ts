import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { MitteilungService } from 'src/app/services/mitteilung.service';

import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Your authentication token (replace 'your-token' with your actual token)
  private authToken: string | null = localStorage.getItem("token");

  constructor(
    private mitteilungService: MitteilungService,
    private router: Router,
    protected readonly keycloak: KeycloakService
  ){}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    
    // Der Authorization Header wird bereits von keycloak-angular in "app.modules.ts" gesetzt.
    /* 
    // Die Cookies im Request setzen
    const authRequest = request.clone(
      {
        setHeaders: {
          'Authorization': `Bearer ${Token_Platzhalter}`,
        },
      }
    );
    */

    // Übergabe der geänderten Anfrage an den nächsten Abfangjäger oder den HTTP-Client
    return next.handle(
      request
      // authRequest
    ).pipe(
      tap((value:any) => {
        if(value.type != 0 && value.body && value.body.message){
          const statusCodeInMessage = value.body.message.code;
          
          if(statusCodeInMessage != 200){
            /*
            switch(statusCodeInMessage){
              case 401:
                this.mitteilungService.createFehlermeldungsDialog("Sie sind nicht Angemeldet, um auf die Ressource zuzugreifen")
                setTimeout(()=>{
                  //window.location.href = environment.wordpressLoginUrl;
                }, 2000)
                throw new Error("Sie sind nicht Berechtigt auf die Ressource zuzugreifen"); // Stop the interceptor chain
                break;
              case 401.404:
                this.mitteilungService.createFehlermeldungsDialog("Ihr Konto konnte nicht gefunden. Melden sie es der IT-Abteilung")
                throw new Error("Ihr Konto konnte nicht gefunden. Melden sie es der IT-Abteilung");
                break;
              case 403:
                
                break;
              case 440:
                localStorage.removeItem('token');
                localStorage.removeItem('timestamp');
                this.mitteilungService.createFehlermeldungsDialog("Ihre Sitzung ist abgelaufen. Sie müssen sich erneut anmelden")
  
                setTimeout(()=>{
                  //window.location.href = environment.wordpressLoginUrl;
                }, 2000)
                throw new Error("Ihre Sitzung ist abgelaufen. Sie müssen sich erneut anmelden");
                break;
              case 500:
                this.mitteilungService.createFehlermeldungsDialog("Es gab ein unerwarteten Fehler")
                throw new Error("Es gab ein unerwarteten Fehler");
                break;
            }
            */
          }
        }
      })
    );
  }

  
}