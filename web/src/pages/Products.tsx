import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import Icon from '../components/Icon'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard'
import { categoryEmoji } from '../format'
import { useTitle } from '../hooks'
import type { Category, ProductPage } from '../types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
]

export default function Products() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [data, setData] = useState<ProductPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState(params.get('search') || '')

  const category = params.get('category') || ''
  const sort = params.get('sort') || 'newest'
  const page = Number(params.get('page') || 1)
  const search = params.get('search') || ''
  const categoryName = categories.find((c) => c.id === category)?.name

  useTitle(search ? `Search: ${search}` : categoryName || undefined)

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .products(params)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [params])

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next)
  }

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    update({ search: query.trim() || null })
  }

  const onCategory = (id: string) => update({ category: id || null, page: null })

  const onSort = (value: string) => setParams({ sort: value })

  const goToPage = (p: number) => {
    update({ page: p > 1 ? String(p) : null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showHero = !search && !category && page === 1
  const heading = search ? `Results for “${search}”` : categoryName || 'All products'

  return (
    <>
      {showHero && (
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="sparkle" size={14} /> New season picks are in</span>
            <h1>Fresh groceries, delivered in 60 minutes</h1>
            <p>Hand-picked produce, dairy and bakery favourites from local farms. Free delivery on orders over $75.</p>
            <div className="hero-actions">
              <button className="btn btn-light" onClick={() => onCategory('fruits')}>
                Shop fresh fruit <Icon name="arrowRight" size={18} />
              </button>
              <div className="coupon-chip">
                <Icon name="tag" size={16} /> <span>Use <strong>SAVE10</strong> for 10% off $50+</span>
              </div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="hero-emoji e1">🥑</span>
            <span className="hero-emoji e2">🍓</span>
            <span className="hero-emoji e3">🥖</span>
            <span className="hero-emoji e4">🥛</span>
            <span className="hero-emoji e5">🍋</span>
          </div>
        </section>
      )}

      {showHero && (
        <ul className="perks">
          <li><span className="perk-icon"><Icon name="clock" /></span><div><strong>60-minute delivery</strong><span>7 days a week</span></div></li>
          <li><span className="perk-icon"><Icon name="leaf" /></span><div><strong>Freshness guarantee</strong><span>Or your money back</span></div></li>
          <li><span className="perk-icon"><Icon name="truck" /></span><div><strong>Free delivery</strong><span>On orders over $75</span></div></li>
          <li><span className="perk-icon"><Icon name="shield" /></span><div><strong>Pay on delivery</strong><span>Cash or card</span></div></li>
        </ul>
      )}

      <div className="toolbar">
        <form className="search" onSubmit={onSearch} role="search">
          <div className="input-icon">
            <Icon name="search" size={18} />
            <input className="input" type="search" placeholder="Search fruits, dairy, snacks…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
          </div>
          <button className="btn btn-primary">Search</button>
        </form>
        <label className="sort">
          <span className="sort-label">Sort by</span>
          <select className="input" value={sort} onChange={(e) => onSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chips" role="group" aria-label="Categories">
        <button className={`chip ${category === '' ? 'chip-active' : ''}`} aria-pressed={category === ''} onClick={() => onCategory('')}>
          <span aria-hidden="true">🛒</span> All
        </button>
        {categories.map((c) => (
          <button key={c.id} className={`chip ${category === c.id ? 'chip-active' : ''}`} aria-pressed={category === c.id} onClick={() => onCategory(c.id)}>
            <span aria-hidden="true">{categoryEmoji[c.id] ?? '🛒'}</span> {c.name}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error"><Icon name="alert" size={18} /> {error}</div>}

      {loading && !data && (
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {data && (
        <>
          <div className="section-head">
            <h2>{heading}</h2>
            <p className="muted small">{data.total} {data.total === 1 ? 'product' : 'products'}</p>
          </div>
          {data.items.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p className="muted">Try a different search or category.</p>
            </div>
          ) : (
            <div className={`grid ${loading ? 'is-loading' : ''}`}>
              {data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <nav className="pagination" aria-label="Pagination">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              <Icon name="chevronLeft" size={16} /> Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`page-number ${n === data.page ? 'is-current' : ''}`}
                  aria-label={`Page ${n}`}
                  aria-current={n === data.page ? 'page' : undefined}
                  onClick={() => goToPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="page-status muted small">
              Page {data.page} of {data.totalPages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => goToPage(page + 1)}>
              Next <Icon name="chevronRight" size={16} />
            </button>
          </nav>
        </>
      )}
    </>
  )
}
