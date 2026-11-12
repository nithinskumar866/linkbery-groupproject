import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Avatar from './Avatar.jsx'
import { Bookmark, ChevronDown, LogOut, UserPen } from './icons.js'

/** Avatar + name button with an account menu, or "Log in" + "Join for free" for guests. */
export default function UserMenu() {
  const { user, logOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    const items = () => [...(ref.current?.querySelectorAll('[role="menuitem"]') || [])]
    items()[0]?.focus()
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      const list = items()
      const i = list.indexOf(document.activeElement)
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        list[(i + 1) % list.length]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        list[(i - 1 + list.length) % list.length]?.focus()
      } else if (e.key === 'Home') {
        e.preventDefault()
        list[0]?.focus()
      } else if (e.key === 'End') {
        e.preventDefault()
        list[list.length - 1]?.focus()
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
      <div className="auth-links">
        <Link className="auth-login" to="/login">
          Log in
        </Link>
        <Link className="btn btn-primary auth-join" to="/register">
          Join for free
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
  const firstName = (user.name || user.email || '').split(/\s+/)[0]

  return (
    <div
      className="user-menu"
      ref={ref}
      onBlur={(e) => {
        if (open && e.relatedTarget && !ref.current?.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`user-menu-button ${open ? 'is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar user={user} size={32} />
        <span className="user-menu-name" aria-hidden="true">
          {firstName}
        </span>
        <ChevronDown size={14} className="user-menu-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="menu user-menu-pop" role="menu" aria-label="Account">
          <div className="menu-head" role="presentation">
            <Avatar user={user} size={40} />
            <span className="menu-head-text">
              <span className="menu-head-name">{user.name}</span>
              <span className="menu-head-sub">{user.email}</span>
            </span>
          </div>
          <Link role="menuitem" className="menu-item" to="/profile" onClick={close}>
            <Bookmark /> My learning and saved
          </Link>
          <Link role="menuitem" className="menu-item" to="/profile/edit" onClick={close}>
            <UserPen /> Edit profile
          </Link>
          <div className="menu-sep" role="separator" />
          <button role="menuitem" type="button" className="menu-item" onClick={onLogout}>
            <LogOut /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
