import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, imageUrl } from '../api'
import { useCart } from '../cart'
import Icon from '../components/Icon'
import OrderSummary from '../components/OrderSummary'
import PageLoading from '../components/PageLoading'
import { money } from '../format'
import { useTitle } from '../hooks'
import { useToast } from '../toast'
import type { Cart } from '../types'

const FREE_DELIVERY_THRESHOLD = 75

export default function CartPage() {
  const { cart, setCart } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [busy, setBusy] = useState<number | null>(null)

  useTitle('Cart')

  if (!cart) return <PageLoading label="Loading cart…" />

  const run = async (productId: number, action: () => Promise<Cart>) => {
    setBusy(productId)
    try {
      setCart(await action())
    } catch (e) {
      toast.show((e as Error).message, 'error')
    } finally {
      setBusy(null)
    }
  }

  const applyCoupon = async (e: FormEvent) => {
    e.preventDefault()
    setCouponError('')
    if (!code.trim()) return
    try {
      setCart(await api.applyCoupon(code))
      setCode('')
      toast.show('Coupon applied')
    } catch (err) {
      setCouponError((err as Error).message)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🧺</div>
        <h3>Your cart is empty</h3>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </div>
    )
  }

  const units = cart.items.reduce((n, i) => n + i.qty, 0)
  const { subtotal, delivery } = cart.summary
  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const progress = Math.min(100, Math.max(0, (subtotal / FREE_DELIVERY_THRESHOLD) * 100))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Your cart</h1>
          <p className="muted">{units} {units === 1 ? 'item' : 'items'} · Delivered in about 60 minutes</p>
        </div>
        <Link to="/" className="link-more"><Icon name="chevronLeft" size={16} /> Continue shopping</Link>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="card delivery-progress">
            <Icon name="truck" size={22} />
            <div className="delivery-progress-body">
              {toFreeDelivery > 0 && delivery > 0 ? (
                <p>Add <strong>{money(toFreeDelivery)}</strong> more for <strong>free delivery</strong></p>
              ) : (
                <p><strong>You've unlocked free delivery!</strong></p>
              )}
              <div className="progress" aria-hidden="true">
                <span style={{ width: `${delivery === 0 ? 100 : progress}%` }} />
              </div>
            </div>
          </div>

          <section className="card cart-list" aria-label="Cart items">
            {cart.items.map((item) => {
              const max = Math.min(10, item.product.stock)
              return (
                <div className="cart-row" key={item.productId}>
                  <img src={imageUrl(item.product)} className="thumb" />
                  <div className="cart-info">
                    <Link to={`/products/${item.productId}`} className="product-name">{item.product.name}</Link>
                    <div className="muted small">{item.product.unit} · {money(item.product.price)} each</div>
                    {item.product.stock <= 5 && <div className="stock-low small">Only {item.product.stock} left</div>}
                  </div>
                  <div className="stepper">
                    <button disabled={item.qty <= 1 || busy === item.productId} onClick={() => run(item.productId, () => api.updateCartItem(item.productId, item.qty - 1))}>−</button>
                    <span>{item.qty}</span>
                    <button disabled={item.qty >= max || busy === item.productId} onClick={() => run(item.productId, () => api.updateCartItem(item.productId, item.qty + 1))}>+</button>
                  </div>
                  <div className="line-total">{money(item.lineTotal)}</div>
                  <button className="link-danger" onClick={() => run(item.productId, () => api.removeCartItem(item.productId))}>
                    <Icon name="trash" size={16} /> Remove
                  </button>
                </div>
              )
            })}
          </section>
        </div>

        <aside className="card summary-card">
          <h2>Order summary</h2>
          {cart.coupon ? (
            <div className="coupon-applied">
              <Icon name="tag" size={18} />
              <span>
                <strong>{cart.coupon.code}</strong> · {cart.coupon.description}
              </span>
              <button className="link-danger" onClick={async () => setCart(await api.removeCoupon())}>Remove</button>
            </div>
          ) : (
            <form className="coupon" onSubmit={applyCoupon}>
              <label htmlFor="coupon" className="label">Coupon code</label>
              <div className="coupon-row">
                <input id="coupon" className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SAVE10" />
                <button className="btn btn-ghost">Apply</button>
              </div>
              {couponError && <span className="coupon-msg"><Icon name="checkCircle" size={15} /> {couponError}</span>}
            </form>
          )}
          {cart.couponMessage && <div className="alert alert-warn">Coupon removed: {cart.couponMessage}</div>}
          <OrderSummary summary={cart.summary} coupon={cart.coupon?.code} />
          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/checkout')}>
            Proceed to checkout <Icon name="arrowRight" size={18} />
          </button>
          <p className="secure-note"><Icon name="lock" size={14} /> Secure checkout · Pay on delivery</p>
        </aside>
      </div>
    </>
  )
}
