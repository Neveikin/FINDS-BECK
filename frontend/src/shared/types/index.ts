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
  favoriteId?: string; // ID записи Favorite для удаления
}

/** Позиция корзины: товар + выбранный размер и цвет (уникальная комбинация). */
export interface CartLine {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export function cartLineKey(line: Pick<CartLine, 'product' | 'size' | 'color'>) {
  return `${line.product.id}|${line.size}|${line.color}`;
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

/** Строка заказа (после оформления из корзины). */
export interface OrderLineItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderLineItem[];
  deliveryMethod: string;
  paymentMethod: string;
  address: string;
}