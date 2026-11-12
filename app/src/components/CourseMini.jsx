import { Link } from 'react-router-dom'
import PlatformLogo from './PlatformLogo.jsx'
import PriceBadge from './PriceBadge.jsx'
import RatingStars from './RatingStars.jsx'

/** One-line course summary (used in learning path steps). `children` go on the right. */
export default function CourseMini({ course, children }) {
  if (!course) {
    return (
      <div className="course-mini course-mini-missing">
        <span className="subtle">This course is no longer listed.</span>
      </div>
    )
  }
  const meta = [course.platform, course.level, course.duration].filter(Boolean)
  return (
    <div className="course-mini">
      <PlatformLogo name={course.platform} size={20} decorative />
      <div className="course-mini-body">
        <Link className="course-mini-title" to={`/courses/${encodeURIComponent(course.id)}`}>
          {course.title}
        </Link>
        <div className="course-mini-meta">
          <span>{meta.join(' · ')}</span>
          <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="sm" />
          <PriceBadge price={course.price} />
        </div>
      </div>
      {children && <div className="course-mini-side">{children}</div>}
    </div>
  )
}
