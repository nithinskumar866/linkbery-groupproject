import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import Avatar from '../components/Avatar.jsx'
import DemoNotice from '../components/DemoNotice.jsx'
import PageBand from '../components/PageBand.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { fileToAvatarDataUrl } from '../components/imageResize.js'
import { EMAIL_RE, usePageTitle } from '../components/utils.js'
import { Note, Wrap } from './parts.jsx'
import { ICON } from './iconProps.js'

function Status({ status }) {
  if (!status) return null
  const ok = status.type === 'success'
  return (
    <Note type={ok ? 'success' : 'error'} role={ok ? 'status' : 'alert'}>
      {status.text}
    </Note>
  )
}

function ProfileForm({ user, updateProfile }) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [avatar, setAvatar] = useState(user.avatar || null)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileRef = useRef(null)

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)
    setErrors((er) => ({ ...er, avatar: undefined }))
    try {
      setAvatar(await fileToAvatarDataUrl(file))
    } catch (err) {
      setErrors((er) => ({ ...er, avatar: err.message }))
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    const errs = {}
    if (name.trim().length < 2) errs.name = 'Please enter your name (at least 2 characters).'
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Please enter a valid email address.'
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`edit-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), avatar })
      setStatus({ type: 'success', text: 'Profile updated.' })
    } catch (err) {
      setStatus({ type: 'error', text: err?.message || 'Could not update your profile.' })
    } finally {
      setBusy(false)
    }
  }

  const preview = { ...user, name: name || user.name, avatar }

  return (
    <form className="card pg-form-card" onSubmit={onSubmit} noValidate aria-labelledby="edit-details-h">
      <h2 id="edit-details-h" className="pg-h3">
        Your details
      </h2>
      <Status status={status} />

      <div className="pg-avatar-edit">
        <Avatar user={preview} size={72} />
        <div className="pg-avatar-controls">
          <div className="pg-avatar-buttons">
            <input
              ref={fileRef}
              id="edit-avatar"
              type="file"
              accept="image/*"
              className="pg-file-input"
              onChange={onFile}
              aria-describedby="edit-avatar-hint"
            />
            <label htmlFor="edit-avatar" className="btn btn-secondary">
              <Upload {...ICON} /> {avatar ? 'Change photo' : 'Upload photo'}
            </label>
            {avatar && (
              <button type="button" className="btn btn-secondary" onClick={() => setAvatar(null)}>
                Remove
              </button>
            )}
          </div>
          <span id="edit-avatar-hint" className="field-hint">
            {processing ? 'Resizing image…' : 'JPG, PNG or WebP. Cropped square and resized in your browser.'}
          </span>
          {errors.avatar && (
            <span className="field-error" role="alert">
              {errors.avatar}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="edit-name">
          Name
        </label>
        <input
          id="edit-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'edit-name-err' : undefined}
        />
        {errors.name && (
          <span id="edit-name-err" className="field-error">
            {errors.name}
          </span>
        )}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="edit-email">
          Email
        </label>
        <input
          id="edit-email"
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'edit-email-err' : undefined}
        />
        {errors.email && (
          <span id="edit-email-err" className="field-error">
            {errors.email}
          </span>
        )}
      </div>
      <div className="pg-form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy || processing}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function PasswordForm({ changePassword }) {
  const empty = { oldPassword: '', newPassword: '', confirm: '' }
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    const errs = {}
    if (!values.oldPassword) errs.oldPassword = 'Please enter your current password.'
    if (values.newPassword.length < 6) errs.newPassword = 'New password must be at least 6 characters.'
    else if (values.newPassword === values.oldPassword) errs.newPassword = 'New password must be different.'
    if (values.confirm !== values.newPassword) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`pw-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      await changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword })
      setValues(empty)
      setStatus({ type: 'success', text: 'Password changed.' })
    } catch (err) {
      setStatus({ type: 'error', text: err?.message || 'Could not change your password.' })
    } finally {
      setBusy(false)
    }
  }

  const row = (name, label, autoComplete) => (
    <div className="field">
      <label className="field-label" htmlFor={`pw-${name}`}>
        {label}
      </label>
      <PasswordInput
        id={`pw-${name}`}
        name={name}
        value={values[name]}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `pw-${name}-err` : undefined}
      />
      {errors[name] && (
        <span id={`pw-${name}-err`} className="field-error">
          {errors[name]}
        </span>
      )}
    </div>
  )

  return (
    <form className="card pg-form-card" onSubmit={onSubmit} noValidate aria-labelledby="edit-pw-h">
      <h2 id="edit-pw-h" className="pg-h3">
        Change password
      </h2>
      <Status status={status} />
      {row('oldPassword', 'Current password', 'current-password')}
      {row('newPassword', 'New password', 'new-password')}
      {row('confirm', 'Confirm new password', 'new-password')}
      <div className="pg-form-actions">
        <button type="submit" className="btn btn-secondary" disabled={busy}>
          {busy ? 'Updating…' : 'Change password'}
        </button>
      </div>
    </form>
  )
}

export default function EditProfile() {
  usePageTitle('Edit profile')
  const { user, updateProfile, changePassword } = useAuth()
  if (!user) return null // ProtectedRoute handles the redirect

  return (
    <div className="pg-edit">
      <PageBand
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Profile', to: '/profile' }, { label: 'Edit profile' }]}
        title="Edit profile"
        desc="Change your name, email, photo or password."
      >
        <Link className="btn btn-secondary" to="/profile">
          <ArrowLeft {...ICON} /> Back to profile
        </Link>
      </PageBand>
      <Wrap className="pg-page-body">
        <DemoNotice />
        <div className="pg-edit-grid">
          <ProfileForm user={user} updateProfile={updateProfile} />
          <PasswordForm changePassword={changePassword} />
        </div>
      </Wrap>
    </div>
  )
}
