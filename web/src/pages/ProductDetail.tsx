import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, imageUrl } from '../api'
import { useAuth } from '../auth'
import { useCart } from '../cart'
import Icon from '../components/Icon'
import PageLoading from '../components/PageLoading'
import ProductCard from '../components/ProductCard'
import { categoryEmoji, discountPercent, money } from '../format'
import { useTitle } from '../hooks'
import { useToast } from '../toast'
import type { Category, Product } from '../types'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { refresh } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useTitle(product?.name)

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setProduct(null)
    setError('')
    setQty(1)
    api.product(id!).then(setProduct).catch((e) => setError(e.message))
  }, [id])

  useEffect(() => {
    if (!product) return
    api
      .products(new URLSearchParams({ category: product.category, sort: 'rating' }))
      .then((res) => setRelated(res.items.filter((p) => p.id !== product.id).slice(0, 4)))
      .catch(() => setRelated([]))
  }, [product])

  if (error) {
    return (
      <div className="empty">
        <div className="empty-icon">🥲</div>
        <h3>{error}</h3>
        <p className="muted">It may have been removed or the link is incorrect.</p>
        <Link to="/" className="btn btn-primary">Back to shop</Link>
      </div>
    )
  }
  if (!product) return <PageLoading />

  const maxQty = Math.max(1, Math.min(10, product.stock))
  const categoryName = categories.find((c) => c.id === product.category)?.name ?? product.category
  const off = discountPercent(product.price, product.originalPrice)

  const add = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }
    setAdding(true)
    try {
      await api.addToCart(product.id, qty)
      await refresh()
    } catch (e) {
      console.error(e)
    }
    toast.show(`${qty} × ${product.name} added to cart`)
    setAdding(false)
  }

  return (
    <div className="detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Shop</Link></li>
          <li><Link to={`/?category=${product.category}`}>{categoryName}</Link></li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="detail-grid">
        <div className="detail-image">
          <img src={imageUrl(product)} />
          {product.originalPrice && <span className="tag tag-sale tag-lg">Sale{off ? ` −${off}%` : ''}</span>}
        </div>
        <div className="detail-info">
          <span className="category-pill">
            <span aria-hidden="true">{categoryEmoji[product.category] ?? '🛒'}</span> {categoryName}
          </span>
          <h1>{product.name}</h1>
          <div className="detail-meta">
            <span className="rating"><Icon name="star" size={15} /> {product.rating.toFixed(1)}</span>
            <span aria-hidden="true">·</span>
            <span>{product.unit}</span>
          </div>

          <div className="detail-price">
            {money(product.price)}
            {product.originalPrice && <span className="price-old">{money(product.originalPrice)}</span>}
            {product.originalPrice && <span className="save-pill">You save {money(product.originalPrice - product.price)}</span>}
          </div>

          <p className={`stock ${product.inStock ? (product.stock <= 5 ? 'stock-low' : 'stock-ok') : 'stock-out'}`}>
            <span className="stock-dot" aria-hidden="true" />
            {product.inStock ? (product.stock <= 5 ? `Only ${product.stock} left` : 'In stock') : 'Out of stock'}
          </p>

          <p className="detail-desc">{product.description}</p>

          <div className="detail-actions">
            <div className="qty-stepper" role="group" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                <Icon name="minus" size={18} />
              </button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Increase quantity">
                <Icon name="plus" size={18} />
              </button>
            </div>
            <button className="btn btn-primary btn-lg" onClick={add} disabled={adding}>
              <Icon name="cart" size={18} />
              {adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>

          <ul className="detail-perks">
            <li><Icon name="clock" size={18} /> Delivered in about 60 minutes</li>
            <li><Icon name="leaf" size={18} /> Freshness guaranteed or your money back</li>
            <li><Icon name="truck" size={18} /> Free delivery on orders over $75</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <div className="section-head">
            <h2>More from {categoryName}</h2>
            <Link to={`/?category=${product.category}`} className="link-more">
              See all <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
