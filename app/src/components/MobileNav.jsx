import { useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useCompare } from '../hooks/useCompare.js'
import Avatar from './Avatar.jsx'
import Wordmark from './Wordmark.jsx'
import { LogOut, Moon, Sun, X } from './icons.js'
import { SHEET_NAV, categoryGroups, isNavActive } from './nav.js'
import { useDialog } from './useDialog.js'

/** Slide-over menu for small screens: account, navigation, categories and theme. */
export default function MobileNav({ open, onClose, theme, onToggleTheme }) {
  const ref = useRef(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logOut } = useAuth()
  const { compareIds } = useCompare()
  useDialog(ref, open, onClose)

  if (!open) return null
  const groups = categoryGroups()
  const dark = theme === 'dark'

  const onLogout = async () => {
    onClose()
    await logOut()
    navigate('/')
  }

  const categoryLinks = (list) => (
    <ul className="sheet-cats">
      {list.map((c) => {
        const to = `/category/${c.slug}`
        const active = pathname === to
        return (
          <li key={c.slug}>
            <Link to={to} className={`sheet-cat ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={onClose}>
              <span>{c.name}</span>
              <span className="sheet-cat-count">{c.count}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="sheet-root">
      <div className="sheet-overlay" onClick={onClose} aria-hidden="true" />
      <div ref={ref} id="mobile-nav" className="sheet sheet-right" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="sheet-head">
          <Wordmark onClick={onClose} />
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close menu">
            <X />
          </button>
        </div>

        <div className="sheet-body">
          {user ? (
            <div className="sheet-user">
              <Avatar user={user} size={40} />
              <span className="sheet-user-text">
                <span className="sheet-user-name">{user.name}</span>
                <span className="sheet-user-email">{user.email}</span>
              </span>
            </div>
          ) : (
            <div className="sheet-auth">
              <Link to="/register" className="btn btn-primary btn-block" onClick={onClose}>
                Join for free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-block" onClick={onClose}>
                Log in
              </Link>
            </div>
          )}

          <nav aria-label="Main">
            <ul className="sheet-list">
              {SHEET_NAV.map((n) => {
                const active = isNavActive(n, pathname)
                const count = n.to === '/compare' ? compareIds.length : 0
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
              })}
              {user && (
                <>
                  <li>
                    <Link to="/profile" className={`sheet-link ${pathname === '/profile' ? 'is-active' : ''}`} onClick={onClose}>
                      My learning and saved
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile/edit" className={`sheet-link ${pathname === '/profile/edit' ? 'is-active' : ''}`} onClick={onClose}>
                      Edit profile
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <nav aria-label="Categories" className="sheet-section">
            <p className="sheet-label">Technical</p>
            {categoryLinks(groups.technical)}
            <p className="sheet-label">Non-technical</p>
            {categoryLinks(groups.nonTechnical)}
          </nav>
        </div>

        <div className="sheet-foot">
          <button type="button" className="btn btn-secondary" onClick={onToggleTheme} aria-pressed={dark}>
            {dark ? <Sun /> : <Moon />}
            {dark ? 'Light theme' : 'Dark theme'}
          </button>
          {user && (
            <button type="button" className="btn btn-ghost" onClick={onLogout}>
              <LogOut /> Log out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
