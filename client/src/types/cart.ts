import type { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartResponse {
  success: boolean;
  data?: Cart;
  message?: string;
}
