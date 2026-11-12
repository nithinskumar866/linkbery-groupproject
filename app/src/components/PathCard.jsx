import { Link } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import { ArrowRight, PathIcon } from './icons.js'
import { ProgressBar } from './ProgressStatus.jsx'

const PREVIEW_STEPS = 3

/**
 * Learning path summary. variant "card" (default): level · course count, title,
 * the first three steps numbered, progress when logged in, "View path →".
 * variant "row": a compact list row (profile). The whole card links to the path.
 */
export default function PathCard({ path, variant = 'card', className = '' }) {
  const { user } = useAuth()
  const { progress } = useProgress()
  if (!path) return null
  const steps = path.steps || []
  const prog = user ? getPathProgress(path.id, progress) : null
  const started = prog && (prog.completed > 0 || prog.inProgress > 0)
  const href = `/paths/${encodeURIComponent(path.id)}`
  const meta = [path.level, `${steps.length} ${steps.length === 1 ? 'course' : 'courses'}`].filter(Boolean).join(' · ')

  if (variant === 'row') {
    return (
      <div className={`path-row ${className}`.trim()}>
        <span className="path-row-icon" aria-hidden="true">
          <PathIcon path={path} />
        </span>
        <div className="path-row-main">
          <Link to={href} className="path-row-title">
            {path.title}
          </Link>
          <span className="path-row-meta">{meta}</span>
        </div>
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
    <article className={`path-card ${className}`.trim()}>
      <span className="path-card-meta">{meta}</span>
      <h3 className="path-card-title">
        <Link to={href} className="path-card-link">
          {path.title}
        </Link>
      </h3>
      <ol className="path-card-steps" aria-label="First steps">
        {steps.slice(0, PREVIEW_STEPS).map((st, i) => (
          <li key={`${st.courseId}-${i}`}>
            <span className="path-card-step-n" aria-hidden="true">
              {i + 1}
            </span>
            <span className="path-card-step-t">{getCourseById(st.courseId)?.title || st.title}</span>
          </li>
        ))}
      </ol>
      {prog && (
        <div className="path-card-progress">
          <ProgressBar percent={prog.percent} label={`${path.title} progress`} />
          <span className="path-card-progress-text">
            {prog.completed} of {prog.total} done
            {prog.inProgress > 0 && ` · ${prog.inProgress} in progress`}
          </span>
        </div>
      )}
      <span className="path-card-cta" aria-hidden="true">
        View path <ArrowRight size={16} />
      </span>
    </article>
  )
}
