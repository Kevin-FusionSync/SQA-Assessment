import type { Cart, Category, CheckoutForm, Order, Product, ProductPage, User } from './types'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const TOKEN_KEY = 'freshcart.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number
  field?: string
  constructor(message: string, status: number, field?: string) {
    super(message)
    this.status = status
    this.field = field
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get()
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError('Unable to reach FreshCart. Check your connection and try again.', 0)
  }
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(body.error || 'Something went wrong', res.status, body.field)
  return body as T
}

const json = (method: string, data?: unknown): RequestInit => ({ method, body: data === undefined ? undefined : JSON.stringify(data) })

export const imageUrl = (p: Product) => `${API_URL}${p.image}`

export const api = {
  login: (email: string, password: string) => request<{ token: string; user: User }>('/api/auth/login', json('POST', { email, password })),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/register', json('POST', { name, email, password })),
  logout: () => request<void>('/api/auth/logout', json('POST')),
  me: () => request<User>('/api/me'),
  updateMe: (data: { name: string; phone: string }) => request<User>('/api/me', json('PUT', data)),

  categories: () => request<Category[]>('/api/categories'),
  products: (params: URLSearchParams) => request<ProductPage>(`/api/products?${params.toString()}`),
  product: (id: string | number) => request<Product>(`/api/products/${id}`),

  cart: () => request<Cart>('/api/cart'),
  addToCart: (productId: number, qty = 1) => request<Cart>('/api/cart/items', json('POST', { productId, qty })),
  updateCartItem: (productId: number, qty: number) => request<Cart>(`/api/cart/items/${productId}`, json('PATCH', { qty })),
  removeCartItem: (productId: number) => request<Cart>(`/api/cart/items/${productId}`, json('DELETE')),
  applyCoupon: (code: string) => request<Cart>('/api/cart/coupon', json('POST', { code })),
  removeCoupon: () => request<Cart>('/api/cart/coupon', json('DELETE')),

  orders: () => request<Order[]>('/api/orders'),
  order: (id: string | number) => request<Order>(`/api/orders/${id}`),
  placeOrder: (form: CheckoutForm) => request<Order>('/api/orders', json('POST', form)),
  cancelOrder: (id: number) => request<Order>(`/api/orders/${id}/cancel`, json('POST')),
}
