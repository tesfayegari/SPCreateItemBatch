export interface ISandwitchShopProps {
  description: string;
}

export interface ISandwitchShopState {
  orders: IOrder[];
  sandwitchName: string;
  quantity: number;
  sandwitches: ISandwitch[];
}

export interface IOrder {
  sandwitches: ISandwitch;
  quantity: number;
}

export interface ISandwitch {
  Title: string;
  unitPrice: number;
  Id: number;
}
