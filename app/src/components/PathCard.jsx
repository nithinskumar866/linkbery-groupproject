import { Link } from 'react-router-dom'
import { getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import { ArrowRight, PathIcon } from './icons.js'
import { ProgressBar } from './ProgressStatus.jsx'

/**
 * Learning path summary. variant "card" (default) is a compact panel,
 * "row" a dense list row. Shows the user's progress when logged in.
 */
export default function PathCard({ path, variant = 'card' }) {
  const { user } = useAuth()
  const { progress } = useProgress()
  if (!path) return null
  const steps = path.steps || []
  const optional = steps.filter((s) => s.optional).length
  const prog = user ? getPathProgress(path.id, progress) : null
  const started = prog && (prog.completed > 0 || prog.inProgress > 0)
  const href = `/paths/${encodeURIComponent(path.id)}`
  const facts = [
    `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}${optional > 0 ? ` (${optional} optional)` : ''}`,
    path.level,
  ].filter(Boolean)

  if (variant === 'row') {
    return (
      <div className="path-row">
        <span className="path-row-icon" aria-hidden="true">
          <PathIcon path={path} />
        </span>
        <div className="path-row-main">
          <Link to={href} className="path-row-title">
            {path.title}
          </Link>
          {path.description && <span className="path-row-desc">{path.description}</span>}
        </div>
        <span className="path-row-facts">{facts.join(' · ')}</span>
        <span className="path-row-progress">
          {started ? (
            <>
              <ProgressBar percent={prog.percent} label={`${path.title} progress`} />
              <span className="path-row-pct">{prog.percent}%</span>
            </>
          ) : (
            <ArrowRight className="path-row-arrow" aria-hidden="true" />
          )}
        </span>
      </div>
    )
  }

  return (
    <article className="panel path-card">
      <div className="path-card-top">
        <span className="path-card-icon" aria-hidden="true">
          <PathIcon path={path} />
        </span>
        <span className="path-card-facts">{facts.join(' · ')}</span>
      </div>
      <h3 className="path-card-title">
        <Link to={href}>{path.title}</Link>
      </h3>
      {path.description && <p className="path-card-desc">{path.description}</p>}
      {prog && (
        <div className="path-card-progress">
          <ProgressBar percent={prog.percent} label={`${path.title} progress`} />
          <span className="path-card-progress-text">
            {prog.completed}/{prog.total} done
            {prog.inProgress > 0 && ` · ${prog.inProgress} in progress`}
          </span>
        </div>
      )}
    </article>
  )
}
