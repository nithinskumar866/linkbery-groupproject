import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Avatar from './Avatar.jsx'

const NAV = [
  { to: '/', label: 'Home', icon: 'fa-house', end: true },
  { to: '/courses', label: 'Courses', icon: 'fa-graduation-cap' },
  { to: '/recommend', label: 'Recommend', icon: 'fa-wand-magic-sparkles' },
  { to: '/insights', label: 'Insights', icon: 'fa-chart-column' },
  { to: '/profile', label: 'Profile & saved', icon: 'fa-bookmark' },
  { to: '/about', label: 'About', icon: 'fa-circle-info' },
  { to: '/contact', label: 'Contact', icon: 'fa-headset' },
]

export default function Sidebar({ onNavigate, collapsed, drawerOpen }) {
  const { user } = useAuth()

  return (
    <nav
      id="site-sidebar"
      className={`sidebar ${drawerOpen ? 'is-open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-profile">
        <Avatar user={user} size={collapsed ? 40 : 64} />
        <div className="sidebar-profile-text">
          {user ? (
            <>
              <strong className="sidebar-name" title={user.name}>{user.name}</strong>
              <span className="muted">{user.role || 'Student'}</span>
              <Link className="btn btn-outline btn-sm" to="/profile" onClick={onNavigate}>
                View profile
              </Link>
            </>
          ) : (
            <>
              <strong className="sidebar-name">Guest</strong>
              <span className="muted">Log in to save courses</span>
              <div className="sidebar-auth">
                <Link className="btn btn-primary btn-sm" to="/login" onClick={onNavigate}>
                  Login
                </Link>
                <Link className="btn btn-outline btn-sm" to="/register" onClick={onNavigate}>
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <ul className="sidebar-nav">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} onClick={onNavigate} title={collapsed ? item.label : undefined}>
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
