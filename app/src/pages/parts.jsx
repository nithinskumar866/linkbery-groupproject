// Small building blocks shared by the pages (not general components).
import { Link } from 'react-router-dom'
import { ArrowRight, CircleAlert, CircleCheck, Info } from 'lucide-react'
import { getCourseById } from '../lib/courses.js'
import { getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import EmptyState from '../components/EmptyState.jsx'
import { ICON } from './iconProps.js'
import { pathMeta } from './format.js'

/** Centred content column: --content-max wide with --gutter side padding. */
export function Wrap({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`pg-wrap ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}

/** Section heading row: h2 + one-line description on the left, a link on the right. */
export function SectionHead({ id, title, desc, to, linkText, level = 2 }) {
  const H = `h${level}`
  return (
    <div className="pg-section-head">
      <div className="pg-section-head-text">
        <H id={id} className={level === 2 ? 'pg-h2' : 'pg-h3'}>
          {title}
        </H>
        {desc && <p className="pg-section-desc">{desc}</p>}
      </div>
      {to && (
        <Link className="pg-more" to={to}>
          {linkText} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}

/** Empty state built on the shared EmptyState component. */
export function Empty({ icon, title, hint, children }) {
  return (
    <EmptyState icon={icon} title={title} actions={children}>
      {hint && <p>{hint}</p>}
    </EmptyState>
  )
}

/** Progress bar. Pass a label to expose it to assistive tech. */
export function Meter({ percent = 0, label, tone = 'brand' }) {
  const p = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)))
  const a11y = label
    ? { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': p, 'aria-label': label }
    : { 'aria-hidden': true }
  return (
    <span className={`pg-meter pg-meter-${tone}`} {...a11y}>
      <span className="pg-meter-fill" style={{ width: `${p}%` }} />
    </span>
  )
}

/** Inline message built on the shared .alert primitive. type: info | success | error | warn. */
export function Note({ type = 'info', children, role, className = '' }) {
  const IconCmp = type === 'success' ? CircleCheck : type === 'error' || type === 'warn' ? CircleAlert : Info
  return (
    <div className={`alert alert-${type} pg-note ${className}`.trim()} role={role}>
      <IconCmp {...ICON} />
      <div className="pg-note-body">{children}</div>
    </div>
  )
}

/** Centred auth/account card on a grey page with the logo on top. */
export function AuthCard({ title, sub, children }) {
  return (
    <div className="pg-auth">
      <div className="card pg-auth-card">
        <Link to="/" className="pg-auth-logo" aria-label="Linkbery home">
          <svg width="32" height="32" viewBox="0 0 28 28" aria-hidden="true">
            <rect width="28" height="28" rx="7" className="pg-logo-bg" />
            <circle cx="11" cy="16" r="5" className="pg-logo-dot" />
            <circle cx="18" cy="13" r="4" className="pg-logo-dot" opacity="0.75" />
          </svg>
          <span>Linkbery</span>
        </Link>
        <h1 className="pg-auth-title">{title}</h1>
        {sub && <p className="pg-auth-sub">{sub}</p>}
        {children}
      </div>
    </div>
  )
}

/**
 * Learning path card used on Home and /paths: meta, title, first three steps
 * (course titles) and, when logged in, the progress bar.
 */
export function PathTile({ path, headingLevel = 3 }) {
  const { user } = useAuth()
  const { progress } = useProgress()
  if (!path) return null
  const H = `h${headingLevel}`
  const steps = (path.steps || []).slice(0, 3)
  const more = (path.steps || []).length - steps.length
  const prog = user ? getPathProgress(path.id, progress) : null
  const href = `/paths/${encodeURIComponent(path.id)}`

  return (
    <article className="card pg-path-tile">
      <p className="pg-eyebrow">{pathMeta(path)}</p>
      <H className="pg-path-tile-title">
        <Link to={href} className="pg-stretch">
          {path.title}
        </Link>
      </H>
      <ol className="pg-path-tile-steps" aria-label="First steps">
        {steps.map((s, i) => (
          <li key={`${s.courseId}-${i}`}>
            <span className="pg-path-tile-n" aria-hidden="true">
              {i + 1}
            </span>
            <span>{getCourseById(s.courseId)?.title || s.title}</span>
          </li>
        ))}
      </ol>
      {more > 0 && <p className="pg-path-tile-more">+ {more} more</p>}
      {prog && (
        <div className="pg-path-tile-prog">
          <Meter percent={prog.percent} label={`${path.title} progress`} />
          <span className="pg-path-tile-prog-text">
            {prog.completed} of {prog.total} done
            {prog.inProgress > 0 && ` · ${prog.inProgress} in progress`}
          </span>
        </div>
      )}
      <span className="pg-path-tile-cta" aria-hidden="true">
        View path <ArrowRight {...ICON} size={16} />
      </span>
    </article>
  )
}
