import { Link } from 'react-router-dom'

/**
 * Page title block: optional breadcrumbs ([{ label, to }]), title, subtitle and
 * actions (children) on the right. `icon` is accepted for compatibility but not
 * drawn: typography carries the hierarchy.
 */
export default function PageHeader({ title, subtitle, breadcrumbs, children }) {
  return (
    <header className="page-head">
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
      <div className="page-head-row">
        <div className="page-head-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-desc">{subtitle}</p>}
        </div>
        {children && <div className="page-head-actions">{children}</div>}
      </div>
    </header>
  )
}
