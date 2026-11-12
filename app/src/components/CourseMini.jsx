import { Link } from 'react-router-dom'
import CourseThumb from './CourseThumb.jsx'
import PriceBadge from './PriceBadge.jsx'
import RatingStars from './RatingStars.jsx'
import { courseByline } from './utils.js'

/** Small course summary (thumbnail, byline, title, rating, meta). `children` go on the right. */
export default function CourseMini({ course, children, className = '' }) {
  if (!course) {
    return (
      <div className={`course-mini course-mini-missing ${className}`.trim()}>
        <span className="subtle">This course is no longer listed.</span>
      </div>
    )
  }
  const meta = [course.level, course.duration].filter(Boolean)
  return (
    <div className={`course-mini ${className}`.trim()}>
      <CourseThumb course={course} size="xs" className="course-mini-thumb" />
      <div className="course-mini-body">
        <span className="course-mini-by">{courseByline(course)}</span>
        <Link className="course-mini-title" to={`/courses/${encodeURIComponent(course.id)}`}>
          {course.title}
        </Link>
        <div className="course-mini-meta">
          <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="sm" />
          {meta.length > 0 && <span>{meta.join(' · ')}</span>}
          <PriceBadge price={course.price} />
        </div>
      </div>
      {children && <div className="course-mini-side">{children}</div>}
    </div>
  )
}
