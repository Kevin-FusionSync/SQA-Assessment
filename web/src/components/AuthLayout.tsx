import type { ReactNode } from 'react'
import Icon from './Icon'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside" aria-hidden="true">
        <div className="auth-aside-emoji">
          <span>🥬</span><span>🍊</span><span>🧀</span><span>🥐</span>
        </div>
        <h2>Groceries you'll love, at your door in 60 minutes.</h2>
        <ul>
          <li><Icon name="leaf" size={18} /> Fresh from local farms and bakeries</li>
          <li><Icon name="truck" size={18} /> Free delivery on orders over $75</li>
          <li><Icon name="shield" size={18} /> Pay in cash or card on delivery</li>
        </ul>
      </aside>
      {children}
    </div>
  )
}
