export const environment = {
    production: false,
    protocol: "http://",
    homeUrl: "localhost:4200",
    mplUrl: '',
    apiUrl: 'localhost:8000',

    // Wenn MyProtoLab bereit für den Kunden ist, soll diese Funktion entfernt werden.
    // Dazu einfach STRG + Click auf die Variable 'keycloak_deaktivieren' und alle aufgezeigten Bereiche anpassen
    keycloak_deaktivieren: true,

    keycloak: {
        protocol: "http://",
        url: 'localhost:8084',
        realm: 'myprotolab',
        clientId: 'angular-client'
    }
};