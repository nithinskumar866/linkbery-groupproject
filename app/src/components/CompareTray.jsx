import { Link } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { useCompare } from '../hooks/useCompare.js'
import CourseThumb from './CourseThumb.jsx'
import { X } from './icons.js'

/** White bar fixed to the bottom while 1+ courses are picked for comparison. */
export default function CompareTray() {
  const { compareIds, removeFromCompare, clearCompare, max } = useCompare()
  const courses = compareIds.map((id) => getCourseById(id)).filter(Boolean)
  if (courses.length === 0) return null

  return (
    <section className="compare-tray" aria-label="Courses to compare">
      <div className="container compare-tray-inner">
        <p className="compare-tray-count">
          <strong>Compare</strong>{' '}
          <span className="compare-tray-n">
            {courses.length} of {max}
          </span>
        </p>
        <ul className="compare-tray-items">
          {courses.map((c) => (
            <li key={c.id} className="compare-tray-item">
              <CourseThumb course={c} size="xs" className="compare-tray-thumb" />
              <span className="compare-tray-title" title={c.title}>
                {c.title}
              </span>
              <button
                type="button"
                className="compare-tray-remove"
                onClick={() => removeFromCompare(c.id)}
                aria-label={`Remove ${c.title} from compare`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="compare-tray-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearCompare}>
            Clear
          </button>
          <Link className="btn btn-primary btn-sm" to="/compare">
            Compare now
          </Link>
        </div>
      </div>
    </section>
  )
}
