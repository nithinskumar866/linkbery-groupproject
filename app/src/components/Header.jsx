import { Link, useLocation } from 'react-router-dom'
import { useCompare } from '../hooks/useCompare.js'
import UserMenu from './UserMenu.jsx'
import Wordmark from './Wordmark.jsx'
import { GitCompareArrows, Menu, Moon, Search, Sun } from './icons.js'
import { PRIMARY_NAV, isNavActive, modKeyLabel } from './nav.js'
import { openPalette } from './palette.js'

export default function Header({ theme, onToggleTheme, menuOpen, onOpenMenu }) {
  const { pathname } = useLocation()
  const { compareIds } = useCompare()
  const dark = theme === 'dark'
  const mod = modKeyLabel()

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <button
          type="button"
          className="btn btn-ghost btn-icon topbar-menu"
          onClick={onOpenMenu}
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <Menu />
        </button>

        <Wordmark />

        <nav className="topnav" aria-label="Main">
          <ul>
            {PRIMARY_NAV.map((item) => {
              const active = isNavActive(item, pathname)
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`topnav-link ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="topbar-right">
          <button
            type="button"
            className="search-trigger"
            onClick={() => openPalette()}
            aria-label="Search courses"
            aria-keyshortcuts="Control+K Meta+K /"
          >
            <Search />
            <span className="search-trigger-text">Search courses…</span>
            <span className="search-trigger-keys" aria-hidden="true">
              <kbd className="kbd">{mod}</kbd>
              <kbd className="kbd">K</kbd>
            </span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onToggleTheme}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            data-tip={dark ? 'Light theme' : 'Dark theme'}
          >
            {dark ? <Sun /> : <Moon />}
          </button>

          {compareIds.length > 0 && (
            <Link
              to="/compare"
              className={`btn btn-sm compare-indicator ${pathname === '/compare' ? 'is-current' : ''}`}
              aria-label={`Compare ${compareIds.length} ${compareIds.length === 1 ? 'course' : 'courses'}`}
            >
              <GitCompareArrows />
              <span className="compare-indicator-label">Compare</span>
              <span className="compare-indicator-count">{compareIds.length}</span>
            </Link>
          )}

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
