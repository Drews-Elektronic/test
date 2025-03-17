export interface Leiterplatte {
  id: number;
  breite: number;
  laenge: number;
  fraesen: number; //Boolean
  lagen: number;
  externeKupferDicke: number;
  interneKupferDicken: number[];
  lptyp: string;
  finish: string;
  basismaterial: string;
  dicke: number;
  ipcklasse: number;
  etest: number; //Boolean
  positionsdruck: string;
  positionsdruckfarbe: string;
  loetstopplack: string;
  loetstopplackfarbe: string;
  ulsign: string;
  ulkanada: number; //Boolean
  datecode: string;
  rohssign: string;
  minAbstand: number;
  minLeiterbahn: number;
  minRestring: number;
  minBohrung: number;
  lagenaufbau: string;
  zachsenfraesen: string;
  zachsenfraesentiefe: number;
  fasung: string;
  senkungen: string;
  viatyp: string;
  viafuellung: string;
  anzahlBlindVias: number;
  anzahlBuriedVias: number;
  karbondruck: string;
  kantenmetallisierung: number; //Boolean
  pressfit: number; //Boolean
  durchkontaktierteSchlitze: number; //Boolean
  stiffener: number;
}
