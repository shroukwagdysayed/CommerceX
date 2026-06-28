export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}
