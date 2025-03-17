export interface Angebot {
  id: string;
  prices: Price[];
}

export interface Price {
  deliverytime: number;
  express: boolean;
  origin: string;
  price: number;
  quantity: number;
}
