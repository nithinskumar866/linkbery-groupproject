import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Avatar from './Avatar.jsx'
import { Bookmark, LogOut, UserPen } from './icons.js'

/** Avatar button with a small account menu, or "Log in" for guests. */
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
      } else if (e.key === 'Tab') {
        setOpen(false)
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
      <Link className="btn btn-sm user-login" to="/login">
        Log in
      </Link>
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
        ref={buttonRef}
        type="button"
        className="user-menu-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar user={user} size={24} />
      </button>
      {open && (
        <div className="menu user-menu-pop" role="menu" aria-label="Account">
          <div className="menu-head">
            <span className="menu-head-name">{user.name}</span>
            <span className="menu-head-sub">{user.email}</span>
          </div>
          <Link role="menuitem" className="menu-item" to="/profile" onClick={close}>
            <Bookmark /> Profile and saved
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
