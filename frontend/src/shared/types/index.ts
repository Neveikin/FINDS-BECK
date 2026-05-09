export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId?: string;
  price: number;
  image: string;
  description: string;
  category: string;
  shopId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  products?: Product[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Product[];
  deliveryMethod: string;
  paymentMethod: string;
  address: string;
}