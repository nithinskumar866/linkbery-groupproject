import { Link, useLocation, useNavigate } from 'react-router-dom'
import UserMenu from './UserMenu.jsx'

export default function Header({ onToggleSidebar, sidebarExpanded, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentQ = location.pathname === '/search' ? new URLSearchParams(location.search).get('q') || '' : ''

  const onSubmit = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim() || ''
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  const dark = theme === 'dark'

  return (
    <header className="site-header">
      <button
        type="button"
        className="icon-btn menu-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
        aria-controls="site-sidebar"
        aria-expanded={sidebarExpanded}
      >
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>

      <Link to="/" className="brand" aria-label="Linkbery home">
        <img src="/images/logo.png" alt="" width="34" height="34" />
        <span className="brand-name">Linkbery</span>
      </Link>

      <form className="header-search" role="search" onSubmit={onSubmit}>
        <label htmlFor="header-search-input" className="visually-hidden">
          Search courses
        </label>
        <input
          key={currentQ}
          id="header-search-input"
          name="q"
          type="search"
          defaultValue={currentQ}
          placeholder="Search courses, skills, platforms…"
          autoComplete="off"
        />
        <button type="submit" aria-label="Search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        </button>
      </form>

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={dark}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
