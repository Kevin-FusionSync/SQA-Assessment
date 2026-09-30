import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import AuthLayout from '../components/AuthLayout'
import Icon from '../components/Icon'
import { useTitle } from '../hooks'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useTitle('Sign in')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password')
      return
    }
    setSubmitting(true)
    try {
      await login(email, password)
      navigate((location.state as { from?: string } | null)?.from || '/', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to continue shopping.</p>
        {error && <div className="alert alert-error"><Icon name="alert" size={18} /> {error}</div>}
        <div className="input-icon">
          <Icon name="mail" size={18} />
          <input className="input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="input-icon">
          <Icon name="lock" size={18} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="auth-divider"><span>New to FreshCart?</span></div>
        <Link to="/register" className="btn btn-ghost btn-block">Create an account</Link>
      </form>
    </AuthLayout>
  )
}
