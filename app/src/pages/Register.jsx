import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import DemoNotice from '../components/DemoNotice.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { EMAIL_RE, returnPath, usePageTitle } from '../components/utils.js'

function validate({ name, email, password, confirm }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Please enter your name (at least 2 characters).'
  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email address.'
  if (password.length < 6) errors.password = 'Password must be at least 6 characters.'
  if (confirm !== password) errors.confirm = 'Passwords do not match.'
  return errors
}

export default function Register() {
  usePageTitle('Create account')
  const { user, signUp } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const target = returnPath(location.state)
  if (user) return <Navigate to={target} replace />

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`reg-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      await signUp({ name: values.name.trim(), email: values.email.trim(), password: values.password })
    } catch (err) {
      setFormError(err?.message || 'Could not create your account. Please try again.')
      setBusy(false)
    }
  }

  const field = (name, label, input, hint) => (
    <div className="field">
      <label htmlFor={`reg-${name}`}>{label}</label>
      {input}
      {hint && !errors[name] && <span className="field-hint" id={`reg-${name}-hint`}>{hint}</span>}
      {errors[name] && <span id={`reg-${name}-err`} className="field-error">{errors[name]}</span>}
    </div>
  )
  const common = (name) => ({
    id: `reg-${name}`,
    name,
    value: values[name],
    onChange,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `reg-${name}-err` : undefined,
    required: true,
  })

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>
          <i className="fa-solid fa-user-plus" aria-hidden="true" /> Create an account
        </h1>
        <p className="muted">Save courses you like and come back to them later.</p>
        {location.state?.message && (
          <div className="alert alert-warn" role="status">
            <i className="fa-solid fa-lock" aria-hidden="true" /> <span>{location.state.message}</span>
          </div>
        )}
        <DemoNotice />
        {formError && (
          <div className="alert alert-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> <span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          {field('name', 'Name', <input {...common('name')} type="text" className="input" autoComplete="name" />)}
          {field('email', 'Email', <input {...common('email')} type="email" className="input" autoComplete="email" />)}
          {field(
            'password',
            'Password',
            <PasswordInput {...common('password')} autoComplete="new-password" />,
            'At least 6 characters.',
          )}
          {field('confirm', 'Confirm password', <PasswordInput {...common('confirm')} autoComplete="new-password" />)}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" state={location.state}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
