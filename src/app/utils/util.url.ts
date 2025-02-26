export class UtilUrl {
  
  // URL's
  public static home: string[] = [""]

  public static login: string[] = ["login"]

  public static menu: string[] = ["menu"]

  public static unberechtigt: string[] = ["unberechtigt"]

  public static vorschlaege: string[] = ["vorschlaege"]

  public static fehlermeldungen: string[] = ["fehlermeldungen"]

  public static neuesProjekt: any = {
    neues_projekt:                                                                ['neues-projekt']
    , import:                                                                     ["neues-projekt", "import"]
    , import_anlegen:                                                             ["neues-projekt", "import", "anlegen"]
    , import_konfiguration:                                                       ["neues-projekt", "import", "konfiguration"]
    , leiterplatte:                 (bgnr: number|string)=>                       ["neues-projekt", "baugruppen", bgnr, "leiterplatte"]
    , bom:                          (bgnr: number|string)=>                       ["neues-projekt", "baugruppen", bgnr, "bom"]
    , alternativ:                   (bgnr: number|string, slnr: number|string)=>  ["neues-projekt", "baugruppen", bgnr, "bom", slnr, "alternativ"]
    , vergleichen:                  (bgnr: number|string, aunr: number|string)=>  ["neues-projekt", "baugruppen", bgnr, "angebote", aunr, "vergleichen"]
    , vergleichen_alternativ:       (bgnr: number|string, aunr: number|string)=>  ["neues-projekt", "baugruppen", bgnr, "angebote", aunr, "vergleichen", "alternativ"]
    , zusammenfassung:              (bgnr: number|string, aunr: number|string)=>  ["neues-projekt", "baugruppen", bgnr, "angebote", aunr, "zusammenfassung"]
    , bestaetigen:                  (bgnr: number|string, aunr: number|string)=>  ["neues-projekt", "baugruppen", bgnr, "angebote", aunr, "bestaetigen"]
  };

  public static neuesAngebot: any = {
    neues_angebot_baugruppen:                                                     ['neues-angebot', "baugruppen"]
    , neues_angebot:                (bgnr: number|string)=>                       ['neues-angebot', "baugruppen", bgnr]
    , leiterplatte:                 (bgnr: number|string)=>                       ["neues-angebot", "baugruppen", bgnr, "leiterplatte"]
    , bom:                          (bgnr: number|string)=>                       ["neues-angebot", "baugruppen", bgnr, "bom"]
    , alternativ:                   (bgnr: number|string, slnr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "bom", slnr, "alternativ"]
    , vergleichen:                  (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "vergleichen"]
    , zusammenfassung:              (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "zusammenfassung"]
    , bestaetigen:                  (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "bestaetigen"]
    , vergleichen_alternativ:       (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "vergleichen", "alternativ"]
  };

  public static angebotFortfahren: any = {
    angebote:                                                                     ['angebot-fortfahren', "baugruppen"] // Hat zurzeit keine Route, wird aber verwendet
    , angebot_fortfahren:           (bgnr: number|string, aunr: number|string)=>  ['angebot-fortfahren', "baugruppen", bgnr, "angebote", aunr]
    , leiterplatte:                 (bgnr: number|string, aunr: number|string)=>  ["angebot-fortfahren", "baugruppen", bgnr, "angebote", aunr, "leiterplatte"]
    , bom:                          (bgnr: number|string, aunr: number|string)=>  ["angebot-fortfahren", "baugruppen", bgnr, "angebote", aunr, "bom"]
    , vergleichen:                  (bgnr: number|string, aunr: number|string)=>  ["angebot-fortfahren", "baugruppen", bgnr, "angebote", aunr, "vergleichen"]
    , zusammenfassung:              (bgnr: number|string, aunr: number|string)=>  ["angebot-fortfahren", "baugruppen", bgnr, "angebote", aunr, "zusammenfassung"]
    , bestaetigen:                  (bgnr: number|string, aunr: number|string)=>  ["angebot-fortfahren", "baugruppen", bgnr, "angebote", aunr, "bestaetigen"]
    , vergleichen_alternativ:       (bgnr: number|string, aunr: number|string)=>  ["angebot-fortfahren", "baugruppen", bgnr, "angebote", aunr, "vergleichen", "alternativ"]
  };

  public static angebote: any = {
    angebote:                                                         ['angebote']
    , anlegen:                                                        ['angebote', 'anlegen']
    , unterlagen:       (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "unterlagen"]
    , leiterplatte:     (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "leiterplatte"]
    , bom:              (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "bom"]
    , vergleichen:      (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "vergleichen"]
    , zusammenfassung:  (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "zusammenfassung"]
    , bestaetigen:      (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "bestaetigen"]
    , checkout: { // Wenn der untere Route geändert wird, MUSS auch in PHP der "Erfolgreich" Redirect für Stripe angepasst werden
      erfolgreich:      (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "checkout-erfolgreich"]
    }
  };

  public static baugruppen: any = {
    baugruppen:                                                       ['baugruppen']
    , anlegen:                                                        ['baugruppen', 'anlegen']
    , leiterplatte:     (bgnr: number|string)=>                       ["baugruppen", bgnr, "leiterplatte"]
    , bom:              (bgnr: number|string)=>                       ["baugruppen", bgnr, "bom"]
    , alternativ:       (bgnr: number|string, slnr: number|string)=>  ["baugruppen", bgnr, "bom", slnr, "alternativ"]
  };

  public static bestellungen: any = {
    bestellungen:                                         ['bestellungen']
    , leiterplatte:     (bestellungID: number|string)=>   ["bestellungen", bestellungID, "leiterplatte"]
    , bom:              (bestellungID: number|string)=>   ["bestellungen", bestellungID, "bom"]
    , unterlagen:       (bestellungID: number|string)=>   ["bestellungen", bestellungID, "unterlagen"]
  };

  public static import: any = {
    import:                                       ['import']
    , anlegen:                                    ['import', 'anlegen']
    , konfiguration:                              ['import', 'konfiguration']
  };

  public static kundenbauteil: any = {
    kundenbauteil:                                ['bauteile']
    , anlegen:                                    ['bauteile', 'anlegen']
  };

  public static kunden: any = {
    kundendaten:                                  ['kundendaten']
    , kunden:                                     ['kunden']
    , uebersicht:                                 ['kunden', "uebersicht"]
    , anlegen:                                    ['kunde', 'anlegen']
  };

  public static bauteil_suche: string[] =         ['bauteil-suche']

}
