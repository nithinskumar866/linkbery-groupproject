import { useCompare } from '../hooks/useCompare.js'
import { GitCompareArrows } from './icons.js'
import { showToast } from './toast.js'

/** "Add to compare" toggle. Works for guests. Shows the lib's "up to 3" error as a toast. */
export default function CompareButton({ courseId, courseTitle, variant = 'compact' }) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare()
  const active = isInCompare(courseId)

  const onClick = (e) => {
    e.stopPropagation()
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

  if (variant === 'full') {
    return (
      <button
        type="button"
        className={`btn compare-btn-full ${active ? 'is-active' : ''}`}
        onClick={onClick}
        aria-pressed={active}
      >
        <GitCompareArrows />
        {active ? 'In compare' : 'Compare'}
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`btn btn-ghost btn-icon btn-sm action-btn compare-toggle ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={courseTitle ? `${label}: ${courseTitle}` : label}
      data-tip={active ? 'In compare' : 'Compare'}
    >
      <GitCompareArrows />
    </button>
  )
}
