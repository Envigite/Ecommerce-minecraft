export interface IAddress {
  id?: string;
  user_id: string;
  alias?: string;
  street: string;
  number?: string;
  city: string;
  region: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}

export interface ICard {
  id?: string;
  user_id: string;
  last4: string;
  brand: string;
  name: string;
  gateway_token?: string;
}

export interface IOrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface ICreateOrder {
  user_id: string;
  total: number;
  delivery_type: string;
  address_id?: string | null;
  payment_method: string;
  items: IOrderItem[];
}