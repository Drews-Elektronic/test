export enum BestellungStatus { // Int's werden angezeigt, string's sollen 'versteckt' bleiben. Siehe bestellung.component.ts und .html
  BESTELLT = 1,
  BEZAHLT = 2,
  NICHT_BEZAHLT = "3",
  BESTAETIGT = 4,
  WARTET_MATERIAL = 5,
  IN_PRODUKTION = 6,
  VERSENDET = 7
}