import { Link } from 'react-router-dom'
import Icon from './Icon'
import Logo from './Logo'

const SHOP_LINKS = [
  { id: 'fruits', name: 'Fruits' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'dairy', name: 'Dairy & Eggs' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'snacks', name: 'Snacks' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand" aria-label="FreshCart home">
            <Logo size={32} />
            <span className="brand-text">Fresh<span>Cart</span></span>
          </Link>
          <p>Farm-fresh groceries from local growers and bakers, delivered to your door in about an hour.</p>
        </div>
        <nav aria-label="Shop categories">
          <h2 className="footer-title">Shop</h2>
          <ul>
            {SHOP_LINKS.map((c) => (
              <li key={c.id}><Link to={`/?category=${c.id}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <h2 className="footer-title">Account</h2>
          <ul>
            <li><Link to="/orders">Order history</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="footer-title">Customer care</h2>
          <ul className="footer-contact">
            <li><Icon name="clock" size={16} /> Every day, 7am – 11pm</li>
            <li><Icon name="mail" size={16} /> support@freshcart.example</li>
            <li><Icon name="phone" size={16} /> (555) 010-2026</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FreshCart · Fresh groceries, delivered.</span>
        <span className="footer-pay"><Icon name="lock" size={14} /> Secure checkout · Cash or card on delivery</span>
      </div>
    </footer>
  )
}
