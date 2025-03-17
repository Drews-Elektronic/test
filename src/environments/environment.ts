export const environment = {
  production: false,
  protocol: "http://",
  homeUrl: "host.docker.internal:4200",
  mplUrl: '',
  apiUrl: 'host.docker.internal:8000',

  // Wenn MyProtoLab bereit für den Kunden ist, soll diese Funktion entfernt werden.
  // Dazu einfach STRG + Click auf die Variable 'keycloak_deaktivieren' und alle aufgezeigten Bereiche anpassen
  keycloak_deaktivieren: false,

  keycloak: {
    protocol: "http://",
    url: 'host.docker.internal:8084',
    realm: 'myprotolab',
    clientId: 'angular-client'
  }
};