import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api, ApiError, imageUrl } from '../api'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import Icon from '../components/Icon'
import OrderSummary from '../components/OrderSummary'
import PageLoading from '../components/PageLoading'
import { money } from '../format'
import { useTitle } from '../hooks'
import type { CheckoutForm } from '../types'

type Field = keyof CheckoutForm

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay the driver in cash', icon: 'cash' },
  { value: 'card', label: 'Card on delivery', hint: 'Tap or insert your card at the door', icon: 'card' },
] as const

export default function Checkout() {
  const { user } = useAuth()
  const { cart, refresh } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<CheckoutForm>({
    fullName: user?.name || '',
    address: '',
    city: '',
    zip: '',
    phone: user?.phone || '',
    paymentMethod: 'cod',
  })
  const [errors, setErrors] = useState<Partial<Record<Field | 'form', string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useTitle('Checkout')

  if (!cart) return <PageLoading />
  if (cart.items.length === 0 && !submitting) return <Navigate to="/cart" replace />

  const set = (key: Field) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value })

  const validate = () => {
    const errs: Partial<Record<Field, string>> = {}
    if (form.fullName.trim().length < 2) errs.fullName = 'Full name is required'
    if (form.address.trim().length < 5) errs.address = 'Street address is required'
    if (form.city.trim().length < 2) errs.city = 'City is required'
    if (!/^\d{5}$/.test(form.zip.trim())) errs.zip = 'ZIP code must be 5 digits'
    if (!/^\d{10,15}$/.test(form.phone.trim())) errs.phone = 'Phone must be 10–15 digits'
    return errs
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    try {
      const order = await api.placeOrder(form)
      await refresh()
      navigate(`/orders/${order.id}/confirmation`, { replace: true })
    } catch (err) {
      const field = err instanceof ApiError && err.field ? err.field : 'form'
      setErrors({ [field]: (err as Error).message })
      setSubmitting(false)
    }
  }

  const field = (key: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="field">
      <label htmlFor={key} className="label">{label}</label>
      <input
        id={key}
        className={`input ${errors[key] ? 'input-error' : ''}`}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        {...props}
      />
      {errors[key] && <span id={`${key}-error`} className="field-error">{errors[key]}</span>}
    </div>
  )

  return (
    <>
      <Link to="/cart" className="back-link"><Icon name="chevronLeft" size={16} /> Back to cart</Link>
      <div className="page-head">
        <h1>Checkout</h1>
        <ol className="steps" aria-label="Checkout progress">
          <li className="is-done"><span><Icon name="check" size={14} /></span> Cart</li>
          <li className="is-current" aria-current="step"><span>2</span> Details</li>
          <li><span>3</span> Confirmation</li>
        </ol>
      </div>
      <form className="checkout-layout" onSubmit={submit} noValidate>
        <div className="stack">
          <section className="card">
            <h2 className="card-title"><Icon name="mapPin" /> Delivery details</h2>
            {errors.form && <div className="alert alert-error"><Icon name="alert" size={18} /> {errors.form}</div>}
            {field('fullName', 'Full name', { autoComplete: 'name' })}
            {field('address', 'Street address', { autoComplete: 'street-address', placeholder: 'House number and street name' })}
            <div className="field-row">
              {field('city', 'City', { autoComplete: 'address-level2' })}
              {field('zip', 'ZIP code', { inputMode: 'numeric', maxLength: 5, autoComplete: 'postal-code' })}
            </div>
            {field('phone', 'Phone number', { inputMode: 'tel', autoComplete: 'tel', placeholder: 'Our driver will call on arrival' })}
          </section>

          <section className="card">
            <h2 className="card-title"><Icon name="card" /> Payment</h2>
            <div className="radio-group">
              {PAYMENT_OPTIONS.map((m) => (
                <label key={m.value} className={`radio ${form.paymentMethod === m.value ? 'radio-active' : ''}`}>
                  <input type="radio" name="payment" checked={form.paymentMethod === m.value} onChange={() => setForm({ ...form, paymentMethod: m.value })} />
                  <span className="radio-icon"><Icon name={m.icon} size={22} /></span>
                  <span className="radio-text">
                    <strong>{m.label}</strong>
                    <span className="muted small">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="card summary-card">
          <h2>Your order</h2>
          <ul className="mini-list">
            {cart.items.map((i) => (
              <li key={i.productId}>
                <img src={imageUrl(i.product)} alt="" className="mini-thumb" />
                <span className="mini-name">
                  {i.product.name}
                  <span className="muted small">Qty {i.qty}</span>
                </span>
                <span>{money(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary summary={cart.summary} coupon={cart.coupon?.code} />
          <button type="submit" className="btn btn-primary btn-block btn-lg">
            {submitting ? 'Placing order…' : `Place order · ${money(cart.summary.total)}`}
          </button>
          <p className="secure-note"><Icon name="shield" size={14} /> You'll pay when your groceries arrive.</p>
        </aside>
      </form>
    </>
  )
}
