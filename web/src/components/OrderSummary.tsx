import { money } from '../format'
import type { Summary } from '../types'

export default function OrderSummary({ summary, coupon }: { summary: Summary; coupon?: string | null }) {
  return (
    <dl className="summary">
      <div>
        <dt>Subtotal</dt>
        <dd>{money(summary.subtotal)}</dd>
      </div>
      {summary.discount > 0 && (
        <div className="summary-discount">
          <dt>Discount{coupon ? ` (${coupon})` : ''}</dt>
          <dd>−{money(summary.discount)}</dd>
        </div>
      )}
      <div>
        <dt>Delivery</dt>
        <dd>{summary.delivery === 0 ? 'Free' : money(summary.delivery)}</dd>
      </div>
      <div>
        <dt>Tax (8%)</dt>
        <dd>{money(summary.tax)}</dd>
      </div>
      <div className="summary-total">
        <dt>Total</dt>
        <dd>{money(summary.total)}</dd>
      </div>
    </dl>
  )
}
