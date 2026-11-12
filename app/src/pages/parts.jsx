// Small building blocks shared by the pages (not general components).
import { Link } from 'react-router-dom'
import { ArrowRight, CircleAlert, CircleCheck, Info } from 'lucide-react'
import { ICON } from './iconProps.js'
import { CategoryIcon } from '../components/icons.js'
import { getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'


/** Section heading row: mono label on the left, optional link on the right. */
export function SectionHead({ id, label, count, to, linkText }) {
  return (
    <div className="pg-section-head">
      <h2 id={id} className="section-label">
        {label}
        {count != null && <span className="pg-count"> · {count}</span>}
      </h2>
      {to && (
        <Link className="pg-head-link" to={to}>
          {linkText} <ArrowRight {...ICON} size={14} />
        </Link>
      )}
    </div>
  )
}

/** Page header using the shared .page-head primitive. */
export function PageHead({ title, desc, crumbs, children }) {
  return (
    <header className="page-head pg-head">
      {crumbs?.length > 0 && (
        <nav className="pg-crumbs" aria-label="Breadcrumb">
          <ol>
            {crumbs.map((c, i) => (
              <li key={`${c.label}-${i}`}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="pg-head-row">
        <div className="pg-head-text">
          <h1 className="page-title">{title}</h1>
          {desc && <p className="page-desc">{desc}</p>}
        </div>
        {children && <div className="pg-head-actions">{children}</div>}
      </div>
    </header>
  )
}

/** Empty state using the shared .empty primitive. `icon` is a Lucide component. */
export function Empty({ icon: IconCmp = Info, title, hint, children }) {
  return (
    <div className="empty" role="status">
      <IconCmp {...ICON} size={24} />
      {title && <p className="pg-empty-title">{title}</p>}
      {hint && <p className="pg-empty-hint">{hint}</p>}
      {children && <div className="pg-empty-actions">{children}</div>}
    </div>
  )
}

/** Thin progress bar (.meter). Pass a label to expose it to assistive tech. */
export function Meter({ percent = 0, label }) {
  const p = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)))
  const a11y = label
    ? { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': p, 'aria-label': label }
    : { 'aria-hidden': true }
  return (
    <span className="meter pg-meter" {...a11y}>
      <span className="meter-fill" style={{ width: `${p}%` }} />
    </span>
  )
}

/** Inline message line. type: info | success | error | warn. */
export function Note({ type = 'info', children, role }) {
  const IconCmp = type === 'success' ? CircleCheck : type === 'error' || type === 'warn' ? CircleAlert : Info
  return (
    <div className={`pg-note pg-note-${type}`} role={role}>
      <IconCmp {...ICON} />
      <div>{children}</div>
    </div>
  )
}

/** The quiet "demo login" line shown on auth and account pages. */
export function DemoLine() {
  return (
    <p className="badge badge-amber pg-demo" role="note">
      Demo login: accounts live only in this browser. Don’t reuse a real password.
    </p>
  )
}

/** One learning path as a dense row with optional progress. */
export function PathRow({ path }) {
  const { user } = useAuth()
  const { progress } = useProgress()
  if (!path) return null
  const steps = path.steps || []
  const prog = user ? getPathProgress(path.id, progress) : null
  return (
    <Link className="pg-path-row" to={`/paths/${encodeURIComponent(path.id)}`}>
      <span className="pg-path-icon">
        <CategoryIcon slug={path.categories?.[0]} size={16} />
      </span>
      <span className="pg-path-main">
        <span className="pg-path-title">{path.title}</span>
        {path.description && <span className="pg-path-desc">{path.description}</span>}
      </span>
      <span className="pg-path-meta">
        {[path.level, `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`].filter(Boolean).join(' · ')}
      </span>
      {prog && (
        <span className="pg-path-prog">
          <Meter percent={prog.percent} />
          <span className="pg-mono">{prog.percent}%</span>
          <span className="visually-hidden">
            {' '}
            complete, {prog.completed} of {prog.total} steps done
          </span>
        </span>
      )}
      <ArrowRight {...ICON} className="pg-path-arrow" />
    </Link>
  )
}
