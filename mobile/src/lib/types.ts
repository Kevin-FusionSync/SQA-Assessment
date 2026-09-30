export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  stock: number;
  inStock: boolean;
  rating: number;
  emoji: string;
  color: string;
  description: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Summary {
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
}

export interface CartItem {
  productId: number;
  qty: number;
  product: Product;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  coupon: { code: string; description: string } | null;
  couponMessage: string | null;
  summary: Summary;
}

export type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: 'cod' | 'card';
  items: { productId: number; name: string; price: number; qty: number }[];
  shipping: { fullName: string; address: string; city: string; zip: string; phone: string };
  coupon?: string | null;
  summary: Summary;
  canCancel: boolean;
}

export interface CheckoutForm {
  fullName: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  paymentMethod: 'cod' | 'card';
}
