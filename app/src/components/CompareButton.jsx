import { useCompare } from '../hooks/useCompare.js'
import { Check, Plus } from './icons.js'
import { showToast } from './toast.js'

/**
 * "+ Compare" / "Added" toggle. Works for guests. Shows the lib's "up to 3" error as a toast.
 * variant: "compact" (default, small button for cards) or "full" (regular height, e.g. side card).
 */
export default function CompareButton({ courseId, courseTitle, variant = 'compact', className = '' }) {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare()
  const active = isInCompare(courseId)

  const onClick = (e) => {
    e.preventDefault()
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
  const size = variant === 'full' ? 'compare-btn-full' : 'btn-sm'

  return (
    <button
      type="button"
      className={`btn btn-secondary ${size} compare-btn ${active ? 'is-active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-pressed={active}
      aria-label={courseTitle ? `${label}: ${courseTitle}` : label}
    >
      {active ? <Check size={16} /> : <Plus size={16} />}
      {active ? 'Added' : 'Compare'}
    </button>
  )
}
