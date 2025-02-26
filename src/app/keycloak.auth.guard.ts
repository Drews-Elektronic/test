import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Keycloak_AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {

    // Falls Keycloak im dev Modus deaktiviert werden
    if(environment.keycloak_deaktivieren){
      return true;
    }

    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: environment.protocol + environment.homeUrl + environment.mplUrl + state.url
      });
    }else{
      const isLoggedIn = await this.keycloak.isLoggedIn()
      if(!isLoggedIn){
        await this.keycloak.clearToken();
        await this.keycloak.login({
          redirectUri: environment.protocol + environment.homeUrl + environment.mplUrl + state.url
        });
      }
    }

    // Überprüfe, ob der Token abgelaufen ist
    if(this.keycloak){
      let isExpired = this.keycloak.isTokenExpired(1800) // Wenn der Token in 30 min abläuft, updaten 
      if(isExpired) {
        await this.keycloak.updateToken(-1).catch((error)=> {throw error})
      }
    }

    // Get the roles required from the route.
    const requiredRoles = route.data['roles'];

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present.
    return requiredRoles.every((role) => this.roles.includes(role));
  }
}