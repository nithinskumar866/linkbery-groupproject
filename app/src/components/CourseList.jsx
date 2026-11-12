import CourseCard from './CourseCard.jsx'
import CourseRow from './CourseRow.jsx'
import EmptyState from './EmptyState.jsx'

/**
 * List of courses as dense rows (default) or compact cards.
 * `empty` renders when there are no courses; `extra(course)` adds a node under each row's meta line.
 */
export default function CourseList({ courses, variant = 'rows', empty, label = 'Courses', extra }) {
  const list = (courses || []).filter(Boolean)
  if (list.length === 0) {
    return empty ?? <EmptyState title="No courses to show" />
  }
  if (variant === 'cards') {
    return (
      <ul className="course-cards" aria-label={label}>
        {list.map((c) => (
          <li key={c.id}>
            <CourseCard course={c} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="course-list" aria-label={label}>
      {list.map((c) => (
        <li key={c.id}>
          <CourseRow course={c} extra={extra ? extra(c) : undefined} />
        </li>
      ))}
    </ul>
  )
}
