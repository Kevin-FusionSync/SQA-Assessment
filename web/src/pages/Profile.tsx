import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../api'
import { useAuth } from '../auth'
import Icon from '../components/Icon'
import { formatDate } from '../format'
import { useTitle } from '../hooks'
import { useToast } from '../toast'

export default function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [errors, setErrors] = useState<{ name?: string; phone?: string; form?: string }>({})
  const [saving, setSaving] = useState(false)

  useTitle('Your profile')

  if (!user) return null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (phone.trim() && !/^\d{10,15}$/.test(phone.trim())) errs.phone = 'Phone must be 10–15 digits'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      setUser(await api.updateMe({ name: name.trim(), phone: phone.trim() }))
      toast.show('Profile updated')
    } catch (err) {
      const field = err instanceof ApiError && (err.field === 'name' || err.field === 'phone') ? err.field : 'form'
      setErrors({ [field]: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Your profile</h1>
          <p className="muted">Manage your personal details.</p>
        </div>
      </div>
      <div className="profile-layout">
        <aside className="card profile-card">
          <span className="avatar avatar-lg" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
          <h2>{user.name}</h2>
          <p className="muted small">{user.email}</p>
          <p className="muted small">Member since {formatDate(user.createdAt)}</p>
          <nav className="profile-links" aria-label="Account">
            <Link to="/orders"><Icon name="package" size={18} /> Order history <Icon name="chevronRight" size={16} /></Link>
            <Link to="/cart"><Icon name="cart" size={18} /> Your cart <Icon name="chevronRight" size={16} /></Link>
          </nav>
        </aside>

        <form className="card" onSubmit={submit} noValidate>
          <h2 className="card-title"><Icon name="user" /> Personal details</h2>
          {errors.form && <div className="alert alert-error"><Icon name="alert" size={18} /> {errors.form}</div>}
          <div className="field">
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" className={`input ${errors.name ? 'input-error' : ''}`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="email" className="label">Email</label>
            <input id="email" className="input" value={user.email} disabled />
            <span className="hint">Your email can't be changed.</span>
          </div>
          <div className="field">
            <label htmlFor="phone" className="label">Phone (optional)</label>
            <input id="phone" className={`input ${errors.phone ? 'input-error' : ''}`} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10–15 digits" autoComplete="tel" />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>
    </>
  )
}
