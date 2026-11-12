import CourseCard from './CourseCard.jsx'
import CourseResult from './CourseResult.jsx'
import EmptyState from './EmptyState.jsx'

const VARIANTS = { list: 'list', rows: 'list', grid: 'grid', cards: 'grid' }

/**
 * Courses as wide list results (variant "list", default) or a card grid ("grid").
 * The old names "rows" and "cards" still work.
 * `empty` renders when there are no courses; `extra(course)` adds a node under each
 * list result's details; `label` names the list for screen readers.
 */
export default function CourseList({ courses, variant = 'list', empty, label = 'Courses', extra, className = '' }) {
  const list = (courses || []).filter(Boolean)
  if (list.length === 0) {
    return empty ?? <EmptyState title="No courses to show" />
  }
  if ((VARIANTS[variant] || 'list') === 'grid') {
    return (
      <ul className={`course-grid ${className}`.trim()} aria-label={label}>
        {list.map((c) => (
          <li key={c.id}>
            <CourseCard course={c} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className={`course-results ${className}`.trim()} aria-label={label}>
      {list.map((c) => (
        <li key={c.id}>
          <CourseResult course={c} extra={extra ? extra(c) : undefined} />
        </li>
      ))}
    </ul>
  )
}
