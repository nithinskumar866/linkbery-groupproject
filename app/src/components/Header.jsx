import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCompare } from '../hooks/useCompare.js'
import ExploreMenu from './ExploreMenu.jsx'
import UserMenu from './UserMenu.jsx'
import Wordmark from './Wordmark.jsx'
import { Menu, Moon, Search, Sun } from './icons.js'
import { PRIMARY_NAV, isNavActive, modKeyLabel } from './nav.js'
import { openPalette } from './palette.js'

/** Header search: a pill field that submits to /search?q=. */
function HeaderSearch() {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const urlQ = pathname === '/search' ? new URLSearchParams(search).get('q') || '' : ''
  const [value, setValue] = useState(urlQ)
  const [lastQ, setLastQ] = useState(urlQ)
  if (lastQ !== urlQ) {
    setLastQ(urlQ)
    setValue(urlQ)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) {
      openPalette()
      return
    }
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form className="header-search" role="search" onSubmit={onSubmit}>
      <Search className="header-search-icon" aria-hidden="true" />
      <label htmlFor="header-q" className="visually-hidden">
        Search courses
      </label>
      <input
        id="header-q"
        className="header-search-input"
        type="search"
        name="q"
        placeholder="What do you want to learn?"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        title={`Press ${modKeyLabel()}+K or / to open quick search`}
      />
    </form>
  )
}

export default function Header({ theme, onToggleTheme, menuOpen, onOpenMenu }) {
  const { pathname } = useLocation()
  const { compareIds } = useCompare()
  const dark = theme === 'dark'
  const n = compareIds.length

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Wordmark />
        <div className="header-desktop">
          <ExploreMenu />
        </div>
        <div className="header-desktop header-search-wrap">
          <HeaderSearch />
        </div>

        <nav className="header-nav header-desktop" aria-label="Main">
          <ul>
            {PRIMARY_NAV.map((item) => {
              const active = isNavActive(item, pathname)
              const isCompare = item.to === '/compare'
              return (
                <li key={item.to} className={`header-nav-item header-nav-${item.to.slice(1)}`}>
                  <Link
                    to={item.to}
                    className={`header-link ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                    {isCompare && n > 0 && <span className="header-link-count">({n})</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-ghost btn-icon header-theme header-desktop"
            onClick={onToggleTheme}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            data-tip={dark ? 'Light theme' : 'Dark theme'}
            data-tip-pos="bottom"
          >
            {dark ? <Sun /> : <Moon />}
          </button>
          <div className="header-desktop header-user">
            <UserMenu />
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-icon header-mobile"
            onClick={() => openPalette()}
            aria-label="Search courses"
          >
            <Search />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon header-mobile"
            onClick={onOpenMenu}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  )
}
