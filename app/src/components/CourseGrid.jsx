import CourseCard from './CourseCard.jsx'
import EmptyState from './EmptyState.jsx'

/** Responsive grid of CourseCards. `empty` is rendered when there are no courses. */
export default function CourseGrid({ courses, empty, label = 'Courses' }) {
  const list = (courses || []).filter(Boolean)
  if (list.length === 0) {
    return empty ?? <EmptyState title="No courses to show" />
  }
  return (
    <ul className="course-grid" aria-label={label}>
      {list.map((c) => (
        <li key={c.id}>
          <CourseCard course={c} />
        </li>
      ))}
    </ul>
  )
}
