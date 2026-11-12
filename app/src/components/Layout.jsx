import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import { applyTheme, getInitialTheme } from './theme.js'

const MOBILE_QUERY = '(max-width: 900px)'
const SIDEBAR_KEY = 'linkbery.sidebar'

function initialCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'collapsed'
  } catch {
    return false
  }
}

export default function Layout() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded')
    } catch {
      // ignore
    }
  }, [collapsed])

  // Scroll to top on page change.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const isMobile = () => window.matchMedia(MOBILE_QUERY).matches
  const toggleSidebar = () => {
    if (isMobile()) setDrawerOpen((o) => !o)
    else setCollapsed((c) => !c)
  }
  const closeDrawer = () => setDrawerOpen(false)

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''} ${drawerOpen ? 'drawer-open' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarExpanded={drawerOpen || !collapsed}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      <Sidebar onNavigate={closeDrawer} collapsed={collapsed} drawerOpen={drawerOpen} />
      {drawerOpen && (
        <button type="button" className="drawer-backdrop" aria-label="Close menu" onClick={closeDrawer} />
      )}
      <div className="app-content">
        <main id="main-content" className="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="site-footer">
          <span>© 2026 Linkbery</span>
          <span className="muted">Course data is collected from public listings; check the provider for current prices.</span>
        </footer>
      </div>
    </div>
  )
}
