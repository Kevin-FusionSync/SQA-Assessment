import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import AuthLayout from '../components/AuthLayout'
import Icon from '../components/Icon'
import { useTitle } from '../hooks'

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'form', string>>

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  useTitle('Create account')

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value })

  const validate = (): Errors => {
    const errs: Errors = {}
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = 'Enter a valid email address'
    if (form.password.length < 8 || !/\d/.test(form.password)) errs.password = 'Password must be at least 8 characters and include a number'
    if (!form.confirm) errs.confirm = 'Please confirm your password'
    return errs
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/', { replace: true })
    } catch (err) {
      const field = (err as { field?: keyof Errors }).field || 'form'
      setErrors({ [field]: (err as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Fresh groceries in under an hour.</p>
        {errors.form && <div className="alert alert-error"><Icon name="alert" size={18} /> {errors.form}</div>}
        <div className="input-icon">
          <Icon name="user" size={18} />
          <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Full name" value={form.name} onChange={set('name')} autoComplete="name" />
        </div>
        {errors.name && <span className="field-error">{errors.name}</span>}
        <div className="input-icon">
          <Icon name="mail" size={18} />
          <input className={`input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="Email address" value={form.email} onChange={set('email')} autoComplete="email" />
        </div>
        {errors.email && <span className="field-error">{errors.email}</span>}
        <div className="input-icon">
          <Icon name="lock" size={18} />
          <input className={`input ${errors.password ? 'input-error' : ''}`} type="password" placeholder="Password" value={form.password} onChange={set('password')} autoComplete="new-password" />
        </div>
        {errors.password ? (
          <span className="field-error">{errors.password}</span>
        ) : (
          <span className="hint">At least 8 characters, including a number.</span>
        )}
        <div className="input-icon">
          <Icon name="lock" size={18} />
          <input className={`input ${errors.confirm ? 'input-error' : ''}`} type="password" placeholder="Confirm password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
        </div>
        {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <p className="muted small center">
          By creating an account you agree to our terms of service.
        </p>
        <div className="auth-divider"><span>Already have an account?</span></div>
        <Link to="/login" className="btn btn-ghost btn-block">Sign in</Link>
      </form>
    </AuthLayout>
  )
}
