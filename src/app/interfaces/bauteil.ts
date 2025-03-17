export interface Bauteil {
    bpknr: number; // MUSS GROß GESCHRIEBEN WERDEN
    btnr: number; 
    btnrkd: string; // bezeichnung
    btbeschreibungkd: string;
    htnrkd: string; // mpn
    htnhkd: string; // Hersteller
    btnrlikd: string; // sku
    linamekd: string; // lieferant
    btbemerkungkd?: string;
    anlagezeitpunkt: string;
    letzteaenderungzpkt: string;
    aglakd: string | number;
    aghakd: string | number;
    agbskd: string | number;
    agbtkd: string | number;
    agstkd: string | number;
    technDaten?: string;
    bauteil_in_bom?: any[];
}

export interface ComboboxenData {
    aglakd: any;
    aghakd: any;
    agbskd: any;
    agaakd: any;
}