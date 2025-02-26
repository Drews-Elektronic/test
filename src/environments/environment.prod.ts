export const environment = {
    production: true,
    protocol: "http://",
    homeUrl: "80.147.63.148:8080",
    mplUrl: '/mpl',
    apiUrl: '80.147.63.148:8080/mpl/php/controller.php',

    keycloak_deaktivieren: true, // Nicht als true setzen
    // Wenn MyProtoLab bereit für den Kunden ist, soll diese Funktion entfernt werden.
    // Dazu einfach STRG + Click auf die Variable 'keycloak_deaktivieren' und alle aufgezeigten Bereiche anpassen

    keycloak: {
        protocol: "https://",
        url: 'login.myprotolab.de',
        realm: 'myprotolab',
        clientId: 'angular-client'
    }
};

// 'http://192.168.20.4/MPL/php/controller.php'; //! Localer URL für Server
// 'http://80.147.63.148:8080/mpl/php/controller.php'; //! Externe URL für Server
// 'login.myprotolab.de'; //! Externe URL für KeyCloak
