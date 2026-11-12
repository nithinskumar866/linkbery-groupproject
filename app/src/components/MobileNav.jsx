import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useCompare } from '../hooks/useCompare.js'
import Avatar from './Avatar.jsx'
import Wordmark from './Wordmark.jsx'
import { X } from './icons.js'
import { PRIMARY_NAV, isNavActive } from './nav.js'
import { useDialog } from './useDialog.js'

const SECONDARY = [
  { to: '/compare', label: 'Compare', match: ['/compare'] },
  { to: '/about', label: 'About', match: ['/about'] },
  { to: '/contact', label: 'Contact', match: ['/contact'] },
]

/** Full-height navigation sheet for small screens. */
export default function MobileNav({ open, onClose }) {
  const ref = useRef(null)
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { compareIds } = useCompare()
  useDialog(ref, open, onClose)

  if (!open) return null

  const item = (n, count) => {
    const active = isNavActive(n, pathname)
    return (
      <li key={n.to}>
        <Link
          to={n.to}
          className={`sheet-link ${active ? 'is-active' : ''}`}
          aria-current={active ? 'page' : undefined}
          onClick={onClose}
        >
          <span>{n.label}</span>
          {count > 0 && <span className="sheet-link-count">{count}</span>}
        </Link>
      </li>
    )
  }

  return (
    <div className="sheet-root">
      <div className="sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div ref={ref} id="mobile-nav" className="sheet sheet-left" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="sheet-head">
          <Wordmark onClick={onClose} />
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close menu">
            <X />
          </button>
        </div>
        <nav className="sheet-body" aria-label="Main">
          <ul className="sheet-list">
            {item({ to: '/', label: 'Home', match: ['/'] }, 0)}
            {PRIMARY_NAV.map((n) => item(n, 0))}
          </ul>
          <p className="section-label sheet-label">More</p>
          <ul className="sheet-list">{SECONDARY.map((n) => item(n, n.to === '/compare' ? compareIds.length : 0))}</ul>
        </nav>
        <div className="sheet-foot">
          {user ? (
            <Link to="/profile" className="sheet-user" onClick={onClose}>
              <Avatar user={user} size={24} />
              <span className="sheet-user-text">
                <span>{user.name}</span>
                <span className="subtle">{user.email}</span>
              </span>
            </Link>
          ) : (
            <div className="sheet-auth">
              <Link to="/login" className="btn" onClick={onClose}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={onClose}>
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
