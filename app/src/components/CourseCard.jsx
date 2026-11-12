import { Link } from 'react-router-dom'
import CourseThumb from './CourseThumb.jsx'
import RatingStars from './RatingStars.jsx'
import PriceBadge from './PriceBadge.jsx'
import SaveButton from './SaveButton.jsx'
import CompareButton from './CompareButton.jsx'
import { StatusBadge } from './ProgressStatus.jsx'
import { courseByline } from './utils.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'

/**
 * Grid course card: 16:9 thumbnail (save bookmark on its corner), provider ·
 * platform, title, rating, type · level, and a footer with the price and "+ Compare".
 * The whole card links to the course; the buttons sit above that link.
 */
export default function CourseCard({ course, className = '' }) {
  const { user } = useAuth()
  const { getStatus } = useProgress()
  if (!course) return null
  const status = user ? getStatus(course.id) : null
  const { id, title, type, level, rating, reviewCount, price } = course
  const href = `/courses/${encodeURIComponent(id)}`
  const meta = [type, level].filter(Boolean).join(' · ')

  return (
    <article className={`course-card ${className}`.trim()}>
      <div className="course-card-media">
        <CourseThumb course={course} size="md" />
        <SaveButton courseId={id} courseTitle={title} className="course-card-save" />
      </div>
      <div className="course-card-body">
        <span className="course-card-by">{courseByline(course) || 'Unknown provider'}</span>
        <h3 className="course-card-title">
          <Link to={href} className="course-card-link">
            {title || 'Untitled course'}
          </Link>
        </h3>
        <RatingStars rating={rating} reviewCount={reviewCount} size="sm" />
        {meta && <span className="course-card-meta">{meta}</span>}
        {status && (
          <span className="course-card-status">
            <StatusBadge status={status} />
          </span>
        )}
        <div className="course-card-foot">
          <PriceBadge price={price} />
          <CompareButton courseId={id} courseTitle={title} />
        </div>
      </div>
    </article>
  )
}
