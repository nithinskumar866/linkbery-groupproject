import { useState } from 'react'
import { tileFor } from './utils.js'

/**
 * Course thumbnail. Uses `course.image` when present (falls back if it fails to
 * load), otherwise a solid --tile-N block with the platform in small caps and
 * the title. Always fills its container's width at 16:9; `size` only changes the
 * tile's type: "xs" (tray, mini rows; colour only), "sm" (lists, path steps,
 * compare header), "md" (cards, default), "lg" (course side card).
 * `label` overrides the small caps line.
 * Decorative: the title is always shown as text next to it.
 */
export default function CourseThumb({ course, size = 'md', className = '', label }) {
  const [failed, setFailed] = useState(false)
  if (!course) return null
  const cls = `course-thumb course-thumb-${size} ${className}`.trim()

  if (course.image && !failed) {
    return (
      <span className={`${cls} course-thumb-img`} aria-hidden="true">
        <img src={course.image} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      </span>
    )
  }

  return (
    <span className={`${cls} course-thumb-tile`} style={{ background: `var(--tile-${tileFor(course)})` }} aria-hidden="true">
      <span className="course-thumb-kicker">{label || course.platform || 'Online course'}</span>
      <span className="course-thumb-title">{course.title}</span>
    </span>
  )
}
