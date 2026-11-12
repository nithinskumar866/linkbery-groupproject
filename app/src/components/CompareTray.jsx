import { Link } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { useCompare } from '../hooks/useCompare.js'
import { ArrowRight, X } from './icons.js'

/** Slim floating bar while 1+ courses are picked for comparison. */
export default function CompareTray() {
  const { compareIds, removeFromCompare, clearCompare, max } = useCompare()
  const courses = compareIds.map((id) => getCourseById(id)).filter(Boolean)
  if (courses.length === 0) return null

  return (
    <section className="compare-tray" aria-label="Courses to compare">
      <span className="compare-tray-count">
        <span className="compare-tray-n">
          {courses.length}/{max}
        </span>
        <span className="compare-tray-word">to compare</span>
      </span>
      <ul className="compare-tray-items">
        {courses.map((c) => (
          <li key={c.id} className="compare-tray-item">
            <span className="compare-tray-title" title={c.title}>
              {c.title}
            </span>
            <button
              type="button"
              className="compare-tray-remove"
              onClick={() => removeFromCompare(c.id)}
              aria-label={`Remove ${c.title} from compare`}
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <div className="compare-tray-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={clearCompare}>
          Clear
        </button>
        <Link className="btn btn-primary btn-sm" to="/compare">
          Compare <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
