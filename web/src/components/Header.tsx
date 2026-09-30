import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import Icon from './Icon'
import Logo from './Logo'

export default function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="announce">
        <div className="container announce-inner">
          <span><Icon name="clock" size={15} /> Delivery in 60 minutes</span>
          <span className="announce-extra"><Icon name="truck" size={15} /> Free delivery on orders over $75</span>
          <span className="announce-extra"><Icon name="leaf" size={15} /> Freshness guaranteed</span>
        </div>
      </div>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="FreshCart home">
          <Logo />
          <span className="brand-text">Fresh<span>Cart</span></span>
        </Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end className="nav-link">
            <Icon name="store" /> <span className="nav-label">Shop</span>
          </NavLink>
          {user && (
            <NavLink to="/orders" className="nav-link">
              <Icon name="package" /> <span className="nav-label">Orders</span>
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" className="nav-link">
              <Icon name="user" /> <span className="nav-label">Profile</span>
            </NavLink>
          )}
          <NavLink to="/cart" className="nav-link cart-link">
            <span className="cart-icon">
              <Icon name="cart" />
              {count > 0 && <span className="badge" aria-label={`${count} items in cart`}>{count}</span>}
            </span>
            <span className="nav-label">Cart</span>
          </NavLink>
          <span className="nav-divider" aria-hidden="true" />
          {user ? (
            <div className="nav-user">
              <span className="avatar avatar-sm" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <Icon name="logout" size={16} /> <span className="nav-label">Log out</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
