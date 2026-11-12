import { Link } from 'react-router-dom'
import CourseThumb from './CourseThumb.jsx'
import PriceBadge from './PriceBadge.jsx'
import RatingStars from './RatingStars.jsx'
import SaveButton from './SaveButton.jsx'
import CompareButton from './CompareButton.jsx'
import { StatusBadge, StatusControl } from './ProgressStatus.jsx'
import { courseByline } from './utils.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'

const MAX_SKILLS = 4

/**
 * Wide list result: thumbnail on the left (save bookmark on it), details in the
 * middle (provider, title, description, rating + meta, skill tags) and a right
 * column with the price, "View course" and "+ Compare".
 *
 * - `extra`: node rendered under the details (e.g. a match bar)
 * - `compact`: smaller thumbnail, no description or skills (path steps)
 * - `children`: extra controls appended to the right column
 * - `showStatus`: progress select in the right column for logged-in users (default true)
 */
export default function CourseResult({ course, extra, compact = false, children, showStatus = true, className = '' }) {
  const { user } = useAuth()
  const { getStatus } = useProgress()
  if (!course) return null
  const { id, title, description, type, level, duration, rating, reviewCount, price } = course
  const href = `/courses/${encodeURIComponent(id)}`
  const meta = [type, level, duration].filter(Boolean).join(' · ')
  const skills = Array.isArray(course.skills) ? course.skills.slice(0, MAX_SKILLS) : []
  const status = user ? getStatus(id) : null

  return (
    <article className={`course-result ${compact ? 'is-compact' : ''} ${className}`.trim()}>
      <div className="course-result-media">
        <CourseThumb course={course} size="sm" />
        <SaveButton courseId={id} courseTitle={title} className="course-result-save" />
      </div>

      <div className="course-result-main">
        <span className="course-result-by">{courseByline(course) || 'Unknown provider'}</span>
        <h3 className="course-result-title">
          <Link to={href}>{title || 'Untitled course'}</Link>
        </h3>
        {!compact && description && <p className="course-result-desc">{description}</p>}
        <div className="course-result-facts">
          <RatingStars rating={rating} reviewCount={reviewCount} size="sm" long />
          {meta && <span>{meta}</span>}
          {status && !showStatus && <StatusBadge status={status} />}
        </div>
        {!compact && skills.length > 0 && (
          <ul className="tag-list course-result-skills" aria-label="Skills">
            {skills.map((s) => (
              <li key={s}>
                <span className="tag">{s}</span>
              </li>
            ))}
          </ul>
        )}
        {extra && <div className="course-result-extra">{extra}</div>}
      </div>

      <div className="course-result-side">
        <span className="course-result-price">
          <PriceBadge price={price} />
        </span>
        <Link className="btn btn-primary course-result-view" to={href} aria-label={`View course: ${title}`}>
          View course
        </Link>
        <CompareButton courseId={id} courseTitle={title} variant={compact ? 'compact' : 'full'} />
        {showStatus && user && <StatusControl courseId={id} courseTitle={title} variant="compact" />}
        {children}
      </div>
    </article>
  )
}

export { CourseResult }
