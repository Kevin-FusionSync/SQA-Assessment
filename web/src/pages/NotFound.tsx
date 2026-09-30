import { Link } from 'react-router-dom'
import { useTitle } from '../hooks'

export default function NotFound() {
  useTitle('Page not found')
  return (
    <div className="empty">
      <div className="empty-code" aria-hidden="true">404</div>
      <h1>Page not found</h1>
      <p className="muted">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary">Back to shop</Link>
    </div>
  )
}
