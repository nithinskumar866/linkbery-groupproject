import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import DemoNotice from '../components/DemoNotice.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { EMAIL_RE, returnPath, usePageTitle } from '../components/utils.js'

function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email address.'
  if (!password) errors.password = 'Please enter your password.'
  return errors
}

export default function Login() {
  usePageTitle('Log in')
  const { user, logIn } = useAuth()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const target = returnPath(location.state)
  if (user) return <Navigate to={target} replace />

  const message = location.state?.message
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`login-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      await logIn({ email: values.email.trim(), password: values.password })
      // The <Navigate> above takes over once the user is set.
    } catch (err) {
      setFormError(err?.message || 'Could not log in. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>
          <i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Log in
        </h1>
        <p className="muted">Welcome back. Log in to save courses and see them on your profile.</p>

        {message && (
          <div className="alert alert-warn" role="status">
            <i className="fa-solid fa-lock" aria-hidden="true" /> <span>{message}</span>
          </div>
        )}
        <DemoNotice />
        {formError && (
          <div className="alert alert-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> <span>{formError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              value={values.email}
              onChange={onChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-err' : undefined}
              required
            />
            {errors.email && <span id="login-email-err" className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              value={values.password}
              onChange={onChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-err' : undefined}
              required
            />
            {errors.password && <span id="login-password-err" className="field-error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New to Linkbery?{' '}
          <Link to="/register" state={location.state}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
