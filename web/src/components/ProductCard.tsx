import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api, imageUrl } from '../api'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import { discountPercent } from '../format'
import { useToast } from '../toast'
import type { Product } from '../types'
import Icon from './Icon'

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth()
  const { setCart } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const off = discountPercent(product.price, product.originalPrice)

  const add = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    setAdding(true)
    try {
      setCart(await api.addToCart(product.id, 1))
      toast.show(`${product.name} added to cart`)
    } catch (e) {
      toast.show((e as Error).message, 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className={`product-card ${product.inStock ? '' : 'is-oos'}`}>
      <Link to={`/products/${product.id}`} className="product-image">
        <img src={imageUrl(product)} loading="lazy" />
        <div className="tags">
          {product.originalPrice && <span className="tag tag-sale">Sale{off ? ` −${off}%` : ''}</span>}
          {product.inStock && product.stock <= 5 && <span className="tag tag-low">Only {product.stock} left</span>}
        </div>
        {!product.inStock && <span className="tag tag-oos">Out of stock</span>}
      </Link>
      <div className="product-body">
        <div className="product-meta">
          <span>{product.unit}</span>
          <span className="rating"><Icon name="star" size={13} /> {product.rating.toFixed(1)}</span>
        </div>
        <Link to={`/products/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="product-footer">
          <div className="price">
            ${product.price}
            {product.originalPrice && <span className="price-old">${product.originalPrice}</span>}
          </div>
          <button className="btn btn-primary btn-sm btn-add" onClick={add} disabled={!product.inStock || adding}>
            {product.inStock && <Icon name="plus" size={16} />}
            {product.inStock ? 'Add' : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="product-body">
        <div className="skeleton skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton skeleton-line" style={{ width: '80%' }} />
        <div className="skeleton skeleton-line" style={{ width: '55%', height: 28, marginTop: 12 }} />
      </div>
    </div>
  )
}
