import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import PasswordInput from '../components/PasswordInput.jsx'
import { EMAIL_RE, returnPath, usePageTitle } from '../components/utils.js'
import { DemoLine, Note } from './parts.jsx'

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

  const describedBy = (name, hint) => {
    if (errors[name]) return `reg-${name}-err`
    return hint ? `reg-${name}-hint` : undefined
  }

  const field = (name, label, input, hint) => (
    <div className="field">
      <label className="field-label" htmlFor={`reg-${name}`}>
        {label}
      </label>
      {input}
      {hint && !errors[name] && (
        <span className="field-hint" id={`reg-${name}-hint`}>
          {hint}
        </span>
      )}
      {errors[name] && (
        <span id={`reg-${name}-err`} className="field-error">
          {errors[name]}
        </span>
      )}
    </div>
  )
  const common = (name, hint) => ({
    id: `reg-${name}`,
    name,
    value: values[name],
    onChange,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': describedBy(name, hint),
    required: true,
  })

  const pwHint = 'At least 6 characters.'

  return (
    <div className="pg-auth">
      <div className="panel pg-auth-panel">
        <h1 className="pg-auth-title">Create an account</h1>
        <p className="pg-auth-sub">Keep a list of courses and track what you are taking.</p>
        {location.state?.message && (
          <Note type="warn" role="status">
            {location.state.message}
          </Note>
        )}
        {formError && (
          <Note type="error" role="alert">
            {formError}
          </Note>
        )}

        <form className="pg-form" onSubmit={onSubmit} noValidate>
          {field('name', 'Name', <input {...common('name')} type="text" className="input" autoComplete="name" />)}
          {field('email', 'Email', <input {...common('email')} type="email" className="input" autoComplete="email" />)}
          {field('password', 'Password', <PasswordInput {...common('password', pwHint)} autoComplete="new-password" />, pwHint)}
          {field('confirm', 'Confirm password', <PasswordInput {...common('confirm')} autoComplete="new-password" />)}
          <button type="submit" className="btn btn-primary pg-btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <DemoLine />

        <p className="pg-auth-switch">
          Have an account?{' '}
          <Link to="/login" state={location.state}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
