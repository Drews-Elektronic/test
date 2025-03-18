export const environment = {
  production: true,
  protocol: "https://",
  homeUrl: "nice-bay-0da23dd03.4.azurestaticapps.net",
  mplUrl: '',
  apiUrl: 'php-myprotolab-hte7d7e6anfgatfu.germanywestcentral-01.azurewebsites.net',

  keycloak_deaktivieren: false, // Nicht als true setzen
  // Wenn MyProtoLab bereit für den Kunden ist, soll diese Funktion entfernt werden.
  // Dazu einfach STRG + Click auf die Variable 'keycloak_deaktivieren' und alle aufgezeigten Bereiche anpassen

  keycloak: {
    protocol: "https://",
    url: 'keycloak.myprotolab.de',
    realm: 'myprotolab',
    clientId: 'angular-client'
  }
};

// 'http://192.168.20.4/MPL/php/controller.php'; //! Localer URL für Server
// 'http://80.147.63.148:8080/mpl/php/controller.php'; //! Externe URL für Server
// 'login.myprotolab.de'; //! Externe URL für KeyCloak
