import { Link } from 'react-router-dom'

/**
 * Page title block with optional icon, subtitle, breadcrumbs ([{ label, to }]) and actions.
 */
export default function PageHeader({ title, subtitle, icon, breadcrumbs, children }) {
  return (
    <header className="page-header">
      {breadcrumbs?.length > 0 && (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((b, i) => (
              <li key={`${b.label}-${i}`}>
                {b.to ? <Link to={b.to}>{b.label}</Link> : <span aria-current="page">{b.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="page-header-row">
        <div className="page-header-text">
          <h1>
            {icon && <i className={`fa-solid ${icon} page-header-icon`} aria-hidden="true" />}
            {title}
          </h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {children && <div className="page-header-actions">{children}</div>}
      </div>
    </header>
  )
}
