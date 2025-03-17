import { Bauteil } from './bauteil';

import { Baugruppe } from './baugruppe';
import { Beistellung } from '../enum/beistellung';

export interface Stuecklistenzeile {
    id: number;
    position: number;
    anzahl: number;
    bauteil: Bauteil;
    elektrischeBezeichnung: string;
    bemerkung?: string;
    bgnr?: string | number;
    agbskd: Beistellung;
}
