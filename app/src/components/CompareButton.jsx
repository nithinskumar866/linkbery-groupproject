import { useCompare } from '../hooks/useCompare.js'
import { showToast } from './toast.js'

/** "Add to compare" toggle. Works for guests. Shows the lib's "up to 3" error as a toast. */
export default function CompareButton({ courseId, courseTitle, variant = 'compact' }) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare()
  const active = isInCompare(courseId)

  const onClick = () => {
    if (active) {
      removeFromCompare(courseId)
      return
    }
    try {
      addToCompare(courseId)
    } catch (err) {
      showToast(err?.message || 'Could not add this course to compare.', { type: 'error' })
    }
  }

  const label = active ? 'Remove from compare' : 'Add to compare'
  const icon = active ? 'fa-solid fa-square-check' : 'fa-regular fa-square'

  if (variant === 'full') {
    return (
      <button
        type="button"
        className={`btn btn-outline compare-btn-full ${active ? 'is-active' : ''}`}
        onClick={onClick}
        aria-pressed={active}
      >
        <i className="fa-solid fa-code-compare" aria-hidden="true" />
        {active ? 'In compare list' : 'Add to compare'}
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`compare-toggle ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={courseTitle ? `${label}: ${courseTitle}` : label}
      title={label}
    >
      <i className={icon} aria-hidden="true" />
      <span>Compare</span>
    </button>
  )
}
