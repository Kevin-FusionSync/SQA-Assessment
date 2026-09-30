import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from './api'
import { useAuth } from './auth'
import type { Cart } from './types'

interface CartState {
  cart: Cart | null
  count: number
  refresh: () => Promise<void>
  setCart: (cart: Cart) => void
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null)
      return
    }
    setCart(await api.cart())
  }, [user])

  useEffect(() => {
    refresh().catch(() => setCart(null))
  }, [refresh])

  const count = cart?.items.length ?? 0

  return <CartContext.Provider value={{ cart, count, refresh, setCart }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
