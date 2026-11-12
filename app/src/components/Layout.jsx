import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import MobileNav from './MobileNav.jsx'
import CommandPalette from './CommandPalette.jsx'
import CompareTray from './CompareTray.jsx'
import Toaster from './Toaster.jsx'
import { useCompare } from '../hooks/useCompare.js'
import { applyTheme, getInitialTheme } from './theme.js'

export default function Layout() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { compareIds } = useCompare()
  const showTray = compareIds.length > 0 && pathname !== '/compare'

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Scroll to top on page change.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`app ${showTray ? 'has-tray' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        menuOpen={menuOpen}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main id="main-content" className="main container" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span className="footer-brand">© 2026 linkbery</span>
          <span className="footer-note">Course data comes from public listings. Check the provider for current prices.</span>
          <nav className="footer-links" aria-label="Footer">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/insights">Insights</Link>
          </nav>
        </div>
      </footer>
      {showTray && <CompareTray />}
      <CommandPalette />
      <Toaster />
    </div>
  )
}
