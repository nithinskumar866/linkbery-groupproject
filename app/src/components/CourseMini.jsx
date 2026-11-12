import { Link } from 'react-router-dom'
import PlatformLogo from './PlatformLogo.jsx'
import PriceBadge from './PriceBadge.jsx'
import { formatRating } from './utils.js'

/** One-row course summary (used in learning path steps). `children` go on the right. */
export default function CourseMini({ course, children }) {
  if (!course) {
    return (
      <div className="course-mini course-mini-missing">
        <span className="muted">This course is no longer listed.</span>
      </div>
    )
  }
  const rating = formatRating(course.rating)
  const meta = [course.platform, course.level, course.duration].filter(Boolean)
  return (
    <div className="course-mini">
      <PlatformLogo name={course.platform} size={36} decorative />
      <div className="course-mini-body">
        <Link className="course-mini-title" to={`/courses/${encodeURIComponent(course.id)}`}>
          {course.title}
        </Link>
        <div className="course-mini-meta">
          {meta.join(' · ')}
          {rating && (
            <span className="course-mini-rating">
              <i className="fa-solid fa-star" aria-hidden="true" /> {rating}
            </span>
          )}
          <PriceBadge price={course.price} />
        </div>
      </div>
      {children && <div className="course-mini-side">{children}</div>}
    </div>
  )
}
