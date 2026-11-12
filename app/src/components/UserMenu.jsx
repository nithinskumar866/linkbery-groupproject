import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Avatar from './Avatar.jsx'

export default function UserMenu() {
  const { user, logOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) {
    return (
      <div className="user-menu user-menu-guest">
        <span className="user-guest-label">
          <Avatar user={null} size={32} />
          <span className="user-name-text">Guest</span>
        </span>
        <Link className="btn btn-ghost btn-sm" to="/login">
          Login
        </Link>
        <Link className="btn btn-primary btn-sm hide-xs" to="/register">
          Register
        </Link>
      </div>
    )
  }

  const close = () => setOpen(false)
  const onLogout = async () => {
    close()
    await logOut()
    navigate('/')
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu-button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar user={user} size={34} />
        <span className="user-name-text">{user.name}</span>
        <i className="fa-solid fa-chevron-down user-menu-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-head">
            <strong>{user.name}</strong>
            <span className="muted">{user.email}</span>
          </div>
          <ul>
            <li>
              <Link to="/profile" onClick={close}>
                <i className="fa-solid fa-bookmark" aria-hidden="true" /> Profile &amp; saved
              </Link>
            </li>
            <li>
              <Link to="/profile/edit" onClick={close}>
                <i className="fa-solid fa-user-pen" aria-hidden="true" /> Edit profile
              </Link>
            </li>
            <li>
              <button type="button" onClick={onLogout}>
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Log out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
