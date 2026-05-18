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
  size?: string;
  color?: string;
}

export interface CartItem {
  id: string; // This will be product.id + size + color for uniqueness in local cart
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'CREATED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  total: number;
  totalPrice?: number;
  items: any[];
  deliveryMethod: string;
  paymentMethod: string;
  address: string;
  adress?: string;
}