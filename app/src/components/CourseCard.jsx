import { Link } from 'react-router-dom'
import PlatformLogo from './PlatformLogo.jsx'
import RatingStars from './RatingStars.jsx'
import SkillChip from './SkillChip.jsx'
import PriceBadge from './PriceBadge.jsx'
import SaveButton from './SaveButton.jsx'

const MAX_SKILLS = 3

export default function CourseCard({ course }) {
  if (!course) return null
  const { id, title, provider, platform, level, type, duration, rating, reviewCount, price } = course
  const skills = Array.isArray(course.skills) ? course.skills : []
  const extra = skills.length - MAX_SKILLS
  const href = `/courses/${encodeURIComponent(id)}`
  const by = [provider, platform].filter(Boolean)
  // Avoid "Udemy · Udemy"
  const byline = by.length === 2 && by[0] === by[1] ? by[0] : by.join(' · ')

  return (
    <article className="course-card">
      <div className="course-card-top">
        <PlatformLogo name={platform} size={40} />
        <div className="course-card-by">
          <span className="course-card-provider" title={byline}>{byline || 'Unknown provider'}</span>
          {type && <span className="course-card-type">{type}</span>}
        </div>
        <SaveButton courseId={id} courseTitle={title} />
      </div>

      <h3 className="course-card-title">
        <Link to={href} title={title}>{title || 'Untitled course'}</Link>
      </h3>

      <ul className="course-card-meta" aria-label="Course details">
        {level && (
          <li>
            <i className="fa-solid fa-signal" aria-hidden="true" /> {level}
          </li>
        )}
        {duration && (
          <li>
            <i className="fa-regular fa-clock" aria-hidden="true" /> {duration}
          </li>
        )}
      </ul>

      <RatingStars rating={rating} reviewCount={reviewCount} size="sm" />

      {skills.length > 0 && (
        <ul className="chip-list course-card-skills" aria-label="Skills">
          {skills.slice(0, MAX_SKILLS).map((s) => (
            <li key={s}>
              <SkillChip title={s}>{s}</SkillChip>
            </li>
          ))}
          {extra > 0 && (
            <li>
              <span className="chip chip-more">+{extra} more</span>
            </li>
          )}
        </ul>
      )}

      <div className="course-card-footer">
        <PriceBadge price={price} />
        <Link className="course-card-link" to={href} aria-label={`View details: ${title}`}>
          Details <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
