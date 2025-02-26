import { Baugruppe } from './baugruppe';

export interface Auftrag {
  id: number;
  baugruppe: Baugruppe; //BGNRKD, Baugruppenbezeichnung
  slok?: number | string;
  prok?: number | string;
  menge: number | string;
  auftragsart?: number | string;
  wunschtermin?: number | string;
  absendetermin?: string;
  antworttermin?: string;
  gesamtkosten?: number | string;
  lztage?: number | string;
  liefertermin?: string; 
  letzteaenderungzpkt?: string;
  anlagezeitpunkt?: string;
  bemerkung?: string;
}
