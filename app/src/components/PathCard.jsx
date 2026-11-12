import { Link } from 'react-router-dom'
import { getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import { ProgressBar } from './ProgressStatus.jsx'

/** Learning path summary card. Shows the user's progress when logged in. */
export default function PathCard({ path }) {
  const { user } = useAuth()
  const { progress } = useProgress()
  if (!path) return null
  const steps = path.steps || []
  const optional = steps.filter((s) => s.optional).length
  const prog = user ? getPathProgress(path.id, progress) : null
  const href = `/paths/${encodeURIComponent(path.id)}`

  return (
    <article className="path-card">
      <div className="path-card-top">
        <span className="path-icon" aria-hidden="true">
          <i className={`fa-solid ${path.icon || 'fa-route'}`} />
        </span>
        <div className="path-card-meta">
          {path.level && <span className="tag">{path.level}</span>}
          <span className="muted path-card-steps">
            {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            {optional > 0 && ` (${optional} optional)`}
          </span>
        </div>
      </div>
      <h3 className="path-card-title">
        <Link to={href}>{path.title}</Link>
      </h3>
      {path.description && <p className="path-card-desc">{path.description}</p>}
      {prog && (
        <div className="path-card-progress">
          <ProgressBar percent={prog.percent} label={`${path.title} progress`} small />
          <span className="muted">
            {prog.completed}/{prog.total} done
            {prog.inProgress > 0 && ` · ${prog.inProgress} in progress`}
          </span>
        </div>
      )}
      <Link className="course-card-link path-card-link" to={href} aria-label={`View path: ${path.title}`}>
        View path <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </Link>
    </article>
  )
}
