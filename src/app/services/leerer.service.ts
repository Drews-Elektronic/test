import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeererService {
  /// Dieser Service soll Leer bleiben
  // Falls KeyCloak in Dev Modus deaktiviert werden soll, wird dieser Service 
  // in app.module.ts in providers als eine alternative benötigt.

  // Wenn MyProtoLab bereit für den Kunden ist, soll die "KeyClouk deaktiviere" Funktion entfernt werden.
  // Dazu einfach STRG + Click auf die Klasse 'EmptyService' und alle aufgezeigten Bereiche anpassen

  constructor() { }
}
