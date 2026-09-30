import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, API_URL } from '../api'
import Icon from '../components/Icon'
import OrderSummary from '../components/OrderSummary'
import PageLoading from '../components/PageLoading'
import { formatDate, money, paymentLabel, statusLabel } from '../format'
import { useTitle } from '../hooks'
import { useToast } from '../toast'
import type { Order, OrderStatus } from '../types'

const TIMELINE: OrderStatus[] = ['placed', 'shipped', 'delivered']

function Timeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="timeline-cancelled">
        <Icon name="x" size={18} /> This order was cancelled. Any items have been returned to stock.
      </div>
    )
  }
  const current = TIMELINE.indexOf(status)
  return (
    <ol className="timeline" aria-label="Order progress">
      {TIMELINE.map((s, i) => (
        <li key={s} className={i <= current ? 'is-done' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="timeline-dot">{i <= current ? <Icon name="check" size={14} /> : i + 1}</span>
          <span>{statusLabel[s]}</span>
        </li>
      ))}
    </ol>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useTitle(`Order #${id}`)

  useEffect(() => {
    api.order(id!).then(setOrder).catch((e) => setError(e.message))
  }, [id])

  if (error) {
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        <h3>{error}</h3>
        <Link to="/orders" className="btn btn-primary">Back to your orders</Link>
      </div>
    )
  }
  if (!order) return <PageLoading />

  const cancel = async () => {
    if (!window.confirm(`Cancel order #${order.id}? This cannot be undone.`)) return
    setCancelling(true)
    try {
      setOrder(await api.cancelOrder(order.id))
      toast.show('Order cancelled')
    } catch (e) {
      toast.show((e as Error).message, 'error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
      <Link to="/orders" className="back-link"><Icon name="chevronLeft" size={16} /> All orders</Link>
      <div className="order-head">
        <h1>Order #{order.id}</h1>
        <span className={`status status-${order.status}`}>{statusLabel[order.status]}</span>
      </div>
      <p className="muted">Placed on {formatDate(order.createdAt)} · {paymentLabel(order.paymentMethod)}</p>

      <div className="card timeline-card">
        <Timeline status={order.status} />
      </div>

      <div className="two-col">
        <div className="stack">
          <section className="card">
            <h2 className="card-title"><Icon name="receipt" /> Items</h2>
            <ul className="mini-list">
              {order.items.map((i) => (
                <li key={i.productId}>
                  <img src={`${API_URL}/images/${i.productId}.svg`} alt="" className="mini-thumb" />
                  <span className="mini-name">
                    {i.name}
                    <span className="muted small">{i.qty} × {money(i.price)}</span>
                  </span>
                  <span>{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="card-title"><Icon name="mapPin" /> Delivery address</h2>
            <address>
              <strong>{order.shipping.fullName}</strong><br />
              {order.shipping.address}<br />
              {order.shipping.city} {order.shipping.zip}<br />
              {order.shipping.phone}
            </address>
          </section>
        </div>
        <aside className="card summary-card">
          <h2>Payment summary</h2>
          <OrderSummary summary={order.summary} coupon={order.coupon} />
          {order.canCancel && (
            <button className="btn btn-danger btn-block" onClick={cancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
          )}
          {order.canCancel && <p className="secure-note">Orders can be cancelled until they ship.</p>}
        </aside>
      </div>
    </>
  )
}
