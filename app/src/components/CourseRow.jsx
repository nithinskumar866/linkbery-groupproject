import { Link } from 'react-router-dom'
import PlatformLogo from './PlatformLogo.jsx'
import PriceBadge from './PriceBadge.jsx'
import RatingStars from './RatingStars.jsx'
import SaveButton from './SaveButton.jsx'
import CompareButton from './CompareButton.jsx'
import { StatusControl } from './ProgressStatus.jsx'
import { courseByline } from './utils.js'

/**
 * Dense course row. The whole row links to the course (stretched title link);
 * the action buttons sit above it. `extra` renders under the meta line.
 */
export default function CourseRow({ course, extra }) {
  if (!course) return null
  const { id, title, platform, level, type, duration, rating, reviewCount, price } = course
  const href = `/courses/${encodeURIComponent(id)}`
  const facts = [level, type, duration].filter(Boolean)

  return (
    <div className="course-row">
      <PlatformLogo name={platform} size={20} decorative />
      <div className="course-row-main">
        <Link to={href} className="course-row-title">
          {title || 'Untitled course'}
        </Link>
        <span className="course-row-by">{courseByline(course) || 'Unknown provider'}</span>
        {facts.length > 0 && <span className="course-row-facts course-row-facts-inline">{facts.join(' · ')}</span>}
        {extra && <div className="course-row-extra">{extra}</div>}
      </div>
      <span className="course-row-facts course-row-facts-col">{facts.join(' · ')}</span>
      <span className="course-row-rating">
        <RatingStars rating={rating} reviewCount={reviewCount} size="sm" />
      </span>
      <span className="course-row-price">
        <PriceBadge price={price} />
      </span>
      <div className="course-row-actions">
        <SaveButton courseId={id} courseTitle={title} />
        <CompareButton courseId={id} courseTitle={title} />
        <StatusControl courseId={id} courseTitle={title} variant="icon" />
      </div>
    </div>
  )
}
