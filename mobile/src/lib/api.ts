import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Cart, Category, CheckoutForm, Order, Product, ProductPage, User } from './types';

function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // When running in Expo Go / a dev build, the Metro host is the machine running the API.
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:4000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
}

export const API_URL = resolveApiUrl();

const TOKEN_KEY = 'freshcart.token';
let memoryToken: string | null = null;

export const tokenStore = {
  async load() {
    memoryToken = await AsyncStorage.getItem(TOKEN_KEY);
    return memoryToken;
  },
  async set(token: string) {
    memoryToken = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  async clear() {
    memoryToken = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status: number, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(memoryToken ? { Authorization: `Bearer ${memoryToken}` } : {}),
      },
    });
  } catch {
    throw new ApiError(`Unable to reach FreshCart at ${API_URL}. Is the API running?`, 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error || 'Something went wrong', res.status, body.field);
  return body as T;
}

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', json('POST', { email, password })),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/register', json('POST', { name, email, password })),
  logout: () => request<void>('/api/auth/logout', json('POST')),
  me: () => request<User>('/api/me'),
  updateMe: (data: { name: string; phone: string }) => request<User>('/api/me', json('PUT', data)),

  categories: () => request<Category[]>('/api/categories'),
  products: (params: Record<string, string | number | undefined>) => {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');
    return request<ProductPage>(`/api/products?${qs}`);
  },
  product: (id: string | number) => request<Product>(`/api/products/${id}`),

  cart: () => request<Cart>('/api/cart'),
  addToCart: (productId: number, qty = 1) => request<Cart>('/api/cart/items', json('POST', { productId, qty })),
  updateCartItem: (productId: number, qty: number) =>
    request<Cart>(`/api/cart/items/${productId}`, json('PATCH', { qty })),
  removeCartItem: (productId: number) => request<Cart>(`/api/cart/items/${productId}`, json('DELETE')),
  applyCoupon: (code: string) => request<Cart>('/api/cart/coupon', json('POST', { code })),
  removeCoupon: () => request<Cart>('/api/cart/coupon', json('DELETE')),

  orders: () => request<Order[]>('/api/orders'),
  order: (id: string | number) => request<Order>(`/api/orders/${id}`),
  placeOrder: (form: CheckoutForm) => request<Order>('/api/orders', json('POST', form)),
  cancelOrder: (id: number) => request<Order>(`/api/orders/${id}/cancel`, json('POST')),
};
