import { CanActivateFn } from '@angular/router';

/// Dieser Guard soll Leer bleiben
// Falls KeyCloak in Dev Modus deaktiviert werden soll, wird dieser Service 
// in app-routing.module.ts als eine alternative benötigt.

// Wenn MyProtoLab bereit für den Kunden ist, soll die "KeyClouk deaktivieren" Funktion entfernt werden.
// Dazu einfach STRG + Click auf die Klasse 'LeererGuard' und alle aufgezeigten Bereiche anpassen

export const LeererGuard: CanActivateFn = (route, state) => {
  return true;
};
