export const money = (n: number) => `$${n.toFixed(2)}`

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const statusLabel: Record<string, string> = {
  placed: 'Placed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const categoryEmoji: Record<string, string> = {
  fruits: '🍎',
  vegetables: '🥦',
  dairy: '🧀',
  bakery: '🥐',
  beverages: '🧃',
  snacks: '🍿',
}

export const discountPercent = (price: number, originalPrice?: number) =>
  originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0

export const paymentLabel = (m: 'cod' | 'card') => (m === 'cod' ? 'Cash on delivery' : 'Card on delivery')
