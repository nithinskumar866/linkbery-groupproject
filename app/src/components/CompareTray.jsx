import { Link } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { useCompare } from '../hooks/useCompare.js'

/** Sticky bar at the bottom while 1+ courses are picked for comparison. */
export default function CompareTray() {
  const { compareIds, removeFromCompare, clearCompare, max } = useCompare()
  const courses = compareIds.map((id) => getCourseById(id)).filter(Boolean)
  if (courses.length === 0) return null

  return (
    <section className="compare-tray" aria-label="Courses to compare">
      <div className="compare-tray-inner">
        <p className="compare-tray-count">
          <i className="fa-solid fa-code-compare" aria-hidden="true" />
          <span>
            Compare <strong>{courses.length}</strong>/{max}
          </span>
        </p>
        <ul className="compare-tray-chips">
          {courses.map((c) => (
            <li key={c.id}>
              <span className="chip compare-chip" title={c.title}>
                <span>{c.title}</span>
                <button
                  type="button"
                  className="compare-chip-remove"
                  onClick={() => removeFromCompare(c.id)}
                  aria-label={`Remove ${c.title} from compare`}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="compare-tray-actions">
          <Link className="btn btn-primary btn-sm" to="/compare">
            Compare now
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearCompare}>
            Clear
          </button>
        </div>
      </div>
    </section>
  )
}
