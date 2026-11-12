import { Link } from 'react-router-dom'
import PlatformLogo from './PlatformLogo.jsx'
import RatingStars from './RatingStars.jsx'
import PriceBadge from './PriceBadge.jsx'
import SaveButton from './SaveButton.jsx'
import CompareButton from './CompareButton.jsx'
import { StatusBadge } from './ProgressStatus.jsx'
import { courseByline } from './utils.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'

const MAX_SKILLS = 2

/** Compact course tile: platform, title, two skill tags and a rating line. */
export default function CourseCard({ course }) {
  const { user } = useAuth()
  const { getStatus } = useProgress()
  if (!course) return null
  const status = user ? getStatus(course.id) : null
  const { id, title, platform, level, rating, reviewCount, price } = course
  const skills = Array.isArray(course.skills) ? course.skills.slice(0, MAX_SKILLS) : []
  const href = `/courses/${encodeURIComponent(id)}`

  return (
    <article className="panel course-card">
      <div className="course-card-top">
        <PlatformLogo name={platform} size={20} decorative />
        <span className="course-card-by" title={courseByline(course)}>
          {courseByline(course) || 'Unknown provider'}
        </span>
        <div className="course-card-actions">
          <SaveButton courseId={id} courseTitle={title} />
          <CompareButton courseId={id} courseTitle={title} />
        </div>
      </div>

      <h3 className="course-card-title">
        <Link to={href}>{title || 'Untitled course'}</Link>
      </h3>

      {skills.length > 0 && (
        <ul className="tag-list course-card-tags" aria-label="Skills">
          {skills.map((s) => (
            <li key={s}>
              <span className="tag" title={s}>
                {s}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="course-card-foot">
        <RatingStars rating={rating} reviewCount={reviewCount} size="sm" />
        {level && <span className="course-card-level">{level}</span>}
        <span className="course-card-spacer" />
        {status ? <StatusBadge status={status} /> : <PriceBadge price={price} />}
      </div>
    </article>
  )
}
