export class UtilUrl {
  
  // URL's
  public static readonly home: string[] = [""]

  public static readonly login: string[] = ["login"]

  public static readonly menu: string[] = ["menu"]

  public static readonly unberechtigt: string[] = ["unberechtigt"]

  public static readonly vorschlaege: string[] = ["vorschlaege"]

  public static readonly fehlermeldungen: string[] = ["fehlermeldungen"]

  public static readonly neuesProjekt: any = {
    neues_projekt:                                                                ['neues-projekt']
    , import:                                                                     ['neues-projekt', "import"]
    , import_konfiguration:                                                       ['neues-projekt', "import", "konfiguration"]
    , leiterplatte:                 (bgnr: number|string)=>                       ['neues-projekt', "baugruppen", bgnr, "leiterplatte"]
    , bom:                          (bgnr: number|string)=>                       ['neues-projekt', "baugruppen", bgnr, "bom"]
    , alternativ:                   (bgnr: number|string, slnr: number|string)=>  ['neues-projekt', "baugruppen", bgnr, "bom", slnr, "alternativ"]
    , vergleichen:                  (bgnr: number|string, aunr: number|string)=>  ['neues-projekt', "baugruppen", bgnr, "angebote", aunr, "vergleichen"]
    , vergleichen_alternativ:       (bgnr: number|string, aunr: number|string)=>  ['neues-projekt', "baugruppen", bgnr, "angebote", aunr, "vergleichen", "alternativ"]
    , zusammenfassung:              (bgnr: number|string, aunr: number|string)=>  ['neues-projekt', "baugruppen", bgnr, "angebote", aunr, "zusammenfassung"]
    , bestaetigen:                  (bgnr: number|string, aunr: number|string)=>  ['neues-projekt', "baugruppen", bgnr, "angebote", aunr, "bestaetigen"]
  };

  public static readonly neuesAngebot: any = {
    neues_angebot_baugruppen:                                                     ['neues-angebot', "baugruppen"]
    , neues_angebot:                (bgnr: number|string)=>                       ['neues-angebot', "baugruppen", bgnr]
    , leiterplatte:                 (bgnr: number|string)=>                       ["neues-angebot", "baugruppen", bgnr, "leiterplatte"]
    , bom:                          (bgnr: number|string)=>                       ["neues-angebot", "baugruppen", bgnr, "bom"]
    , alternativ:                   (bgnr: number|string, id  : number|string)=>  ["neues-angebot", "baugruppen", bgnr, "bom", id, "alternativ"]
    , vergleichen:                  (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "vergleichen"]
    , zusammenfassung:              (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "zusammenfassung"]
    , bestaetigen:                  (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "bestaetigen"]
    , vergleichen_alternativ:       (bgnr: number|string, aunr: number|string)=>  ["neues-angebot", "baugruppen", bgnr, "angebote", aunr, "vergleichen", "alternativ"]
  };

  public static readonly angebote: any = {
    angebote:                                                         ['angebote']
    , anlegen:                                                        ['angebote', 'anlegen']
    , unterlagen:       (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "unterlagen"]
    , leiterplatte:     (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "leiterplatte"]
    , bom:              (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "bom"]
    , alternativ:       (bgnr: number|string, aunr: number|string
                                            , id:   number|string)=>  ["baugruppen", bgnr, "angebote", aunr, "bom", id, "alternativ"]
    , vergleichen:      (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "vergleichen"]
    , zusammenfassung:  (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "zusammenfassung"]
    , bestaetigen:      (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "bestaetigen"]
    , checkout: { // Wenn der untere Route geändert wird, MUSS auch in PHP der "Erfolgreich" Redirect für Stripe angepasst werden
      erfolgreich:      (bgnr: number|string, aunr: number|string)=>  ["baugruppen", bgnr, 'angebote', aunr, "checkout-erfolgreich"]
    }
  };

  public static readonly baugruppen: any = {
    baugruppen:                                                       ['baugruppen']
    , anlegen:                                                        ['baugruppen', 'anlegen']
    , leiterplatte:     (bgnr: number|string)=>                       ["baugruppen", bgnr, "leiterplatte"]
    , bom:              (bgnr: number|string)=>                       ["baugruppen", bgnr, "bom"]
    , alternativ:       (bgnr: number|string, slnr: number|string)=>  ["baugruppen", bgnr, "bom", slnr, "alternativ"]
  };

  public static readonly bestellungen: any = {
    bestellungen:                                         ['bestellungen']
    , leiterplatte:     (bestellungID: number|string)=>   ["bestellungen", bestellungID, "leiterplatte"]
    , bom:              (bestellungID: number|string)=>   ["bestellungen", bestellungID, "bom"]
    , unterlagen:       (bestellungID: number|string)=>   ["bestellungen", bestellungID, "unterlagen"]
  };

  public static readonly import: any = {
    import:                                       ['import']
    , konfiguration:                              ['import', 'konfiguration']
  };

  public static readonly kundenbauteil: any = {
    kundenbauteil:                                ['bauteile']
    , anlegen:                                    ['bauteile', 'anlegen']
  };

  public static readonly kunden: any = {
    kundendaten:                                  ['kundendaten']
    , kunden:                                     ['kunden']
    , uebersicht:                                 ['kunden', "uebersicht"]
    , anlegen:                                    ['kunde', 'anlegen']
  };

  public static readonly bauteil_suche: string[] = ['bauteil-suche']

}
