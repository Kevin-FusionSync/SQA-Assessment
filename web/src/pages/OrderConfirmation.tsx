import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import Icon from '../components/Icon'
import { money, paymentLabel } from '../format'
import { useTitle } from '../hooks'
import type { Order } from '../types'

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useTitle('Order confirmed')

  useEffect(() => {
    api.order(id!).then(setOrder).catch(() => setOrder(null))
  }, [id])

  return (
    <div className="confirm">
      <div className="confirm-badge"><Icon name="check" size={40} /></div>
      <h1>Thank you for your order!</h1>
      {order ? (
        <p className="muted">
          Order <strong>#{order.id}</strong> · {money(order.summary.total)} · arriving in about 60 minutes.
        </p>
      ) : (
        <p className="muted">Order #{id}</p>
      )}

      {order && (
        <div className="card confirm-card">
          <div className="confirm-row">
            <Icon name="clock" />
            <div><strong>Estimated arrival</strong><span className="muted small">About 60 minutes</span></div>
          </div>
          <div className="confirm-row">
            <Icon name="mapPin" />
            <div>
              <strong>Delivering to</strong>
              <span className="muted small">{order.shipping.address}, {order.shipping.city} {order.shipping.zip}</span>
            </div>
          </div>
          <div className="confirm-row">
            <Icon name={order.paymentMethod === 'cod' ? 'cash' : 'card'} />
            <div><strong>Payment</strong><span className="muted small">{paymentLabel(order.paymentMethod)}</span></div>
          </div>
        </div>
      )}

      <div className="row-gap">
        <Link to={`/orders/${id}`} className="btn btn-ghost">View order</Link>
        <Link to="/" className="btn btn-primary">Continue shopping</Link>
      </div>
    </div>
  )
}
