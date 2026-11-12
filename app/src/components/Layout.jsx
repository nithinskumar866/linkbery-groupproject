import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import MobileNav from './MobileNav.jsx'
import CommandPalette from './CommandPalette.jsx'
import CompareTray from './CompareTray.jsx'
import Toaster from './Toaster.jsx'
import { useCompare } from '../hooks/useCompare.js'
import { applyTheme, getInitialTheme } from './theme.js'

/**
 * App shell: header, full-width <main> (pages use .container / PageBand inside),
 * navy footer, compare tray, command palette and toasts.
 */
export default function Layout() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { compareIds } = useCompare()
  const showTray = compareIds.length > 0 && pathname !== '/compare'

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Scroll to top and close the mobile menu on page change.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
  }
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className={`app ${showTray ? 'has-tray' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header theme={theme} onToggleTheme={toggleTheme} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      {showTray && <CompareTray />}
      <CommandPalette />
      <Toaster />
    </div>
  )
}
