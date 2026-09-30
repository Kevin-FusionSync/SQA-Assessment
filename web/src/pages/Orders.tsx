import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, API_URL } from '../api'
import Icon from '../components/Icon'
import PageLoading from '../components/PageLoading'
import { formatDate, money, statusLabel } from '../format'
import { useTitle } from '../hooks'
import type { Order } from '../types'

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')

  useTitle('Your orders')

  useEffect(() => {
    api.orders().then(setOrders).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="alert alert-error"><Icon name="alert" size={18} /> {error}</div>
  if (!orders) return <PageLoading label="Loading orders…" />

  if (orders.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">📦</div>
        <h3>No orders yet</h3>
        <p className="muted">When you place an order, it will show up here.</p>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </div>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Your orders</h1>
          <p className="muted">Track deliveries and view past purchases.</p>
        </div>
      </div>
      <div className="order-list">
        {orders.map((o) => (
          <Link to={`/orders/${o.id}`} key={o.id} className="card order-row">
            <div className="order-thumbs" aria-hidden="true">
              {o.items.slice(0, 3).map((i) => (
                <img key={i.productId} src={`${API_URL}/images/${i.productId}.svg`} alt="" />
              ))}
              {o.items.length > 3 && <span>+{o.items.length - 3}</span>}
            </div>
            <div className="order-main">
              <strong>Order #{o.id}</strong>
              <div className="muted small">
                {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} items
              </div>
            </div>
            <span className={`status status-${o.status}`}>{statusLabel[o.status]}</span>
            <strong className="order-total">{money(o.summary.total)}</strong>
            <Icon name="chevronRight" className="order-chevron" />
          </Link>
        ))}
      </div>
    </>
  )
}
