export interface Address {
  id: string;
  alias: string;
  street: string;
  number: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export interface SavedCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex'; 
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  addresses?: Address[];
  cards?: SavedCard[];
  google_id?: string;
}