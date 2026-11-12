import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Avatar from '../components/Avatar.jsx'
import DemoNotice from '../components/DemoNotice.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import { fileToAvatarDataUrl } from '../components/imageResize.js'
import { EMAIL_RE, usePageTitle } from '../components/utils.js'

function Status({ status }) {
  if (!status) return null
  const ok = status.type === 'success'
  return (
    <div className={`alert ${ok ? 'alert-success' : 'alert-error'}`} role={ok ? 'status' : 'alert'}>
      <i className={`fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-exclamation'}`} aria-hidden="true" />
      <span>{status.text}</span>
    </div>
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
    if (Object.keys(errs).length) return
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
    <form className="card edit-card" onSubmit={onSubmit} noValidate aria-labelledby="h-edit-details">
      <h2 id="h-edit-details">Your details</h2>
      <Status status={status} />

      <div className="avatar-edit">
        <Avatar user={preview} size={88} />
        <div className="avatar-edit-controls">
          <input
            ref={fileRef}
            id="edit-avatar"
            type="file"
            accept="image/*"
            className="file-input"
            onChange={onFile}
            aria-describedby="edit-avatar-hint"
          />
          <label htmlFor="edit-avatar" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-camera" aria-hidden="true" /> {avatar ? 'Change photo' : 'Upload photo'}
          </label>
          {avatar && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAvatar(null)}>
              Remove photo
            </button>
          )}
          <span id="edit-avatar-hint" className="field-hint">
            {processing ? 'Resizing image…' : 'JPG, PNG or WebP. Cropped to a square and resized in your browser.'}
          </span>
          {errors.avatar && <span className="field-error">{errors.avatar}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="edit-name">Name</label>
        <input
          id="edit-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'edit-name-err' : undefined}
        />
        {errors.name && <span id="edit-name-err" className="field-error">{errors.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="edit-email">Email</label>
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
        {errors.email && <span id="edit-email-err" className="field-error">{errors.email}</span>}
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy || processing}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
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
    if (Object.keys(errs).length) return
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
      <label htmlFor={`pw-${name}`}>{label}</label>
      <PasswordInput
        id={`pw-${name}`}
        name={name}
        value={values[name]}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `pw-${name}-err` : undefined}
      />
      {errors[name] && <span id={`pw-${name}-err`} className="field-error">{errors[name]}</span>}
    </div>
  )

  return (
    <form className="card edit-card" onSubmit={onSubmit} noValidate aria-labelledby="h-edit-pw">
      <h2 id="h-edit-pw">Change password</h2>
      <Status status={status} />
      {row('oldPassword', 'Current password', 'current-password')}
      {row('newPassword', 'New password', 'new-password')}
      {row('confirm', 'Confirm new password', 'new-password')}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Updating…' : 'Change password'}
      </button>
    </form>
  )
}

export default function EditProfile() {
  usePageTitle('Edit profile')
  const { user, updateProfile, changePassword } = useAuth()
  if (!user) return null // ProtectedRoute handles redirect

  return (
    <div className="edit-page">
      <PageHeader
        title="Edit profile"
        icon="fa-user-pen"
        breadcrumbs={[{ label: 'Profile', to: '/profile' }, { label: 'Edit' }]}
      >
        <Link className="btn btn-outline" to="/profile">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to profile
        </Link>
      </PageHeader>
      <DemoNotice />
      <div className="edit-grid">
        <ProfileForm user={user} updateProfile={updateProfile} />
        <PasswordForm changePassword={changePassword} />
      </div>
    </div>
  )
}
