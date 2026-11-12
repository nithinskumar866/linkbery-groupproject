import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useSaved } from '../hooks/useSaved.js'
import { Bookmark, BookmarkCheck } from './icons.js'

/**
 * Save (bookmark) toggle. Guests are sent to /login with a message and come back afterwards.
 * variant: "icon" (default; round white button for use over a thumbnail) or "full" (text button).
 */
export default function SaveButton({ courseId, courseTitle, variant = 'icon', className = '' }) {
  const { user } = useAuth()
  const { isSaved, toggleSaved } = useSaved()
  const navigate = useNavigate()
  const location = useLocation()
  const saved = Boolean(user) && isSaved(courseId)

  const goLogin = (message) =>
    navigate('/login', { state: { from: location, message: message || 'Log in to save courses to your profile.' } })

  const onClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      goLogin()
      return
    }
    try {
      toggleSaved(courseId)
    } catch (err) {
      goLogin(err?.message)
    }
  }

  const label = saved ? 'Remove from saved' : 'Save course'
  const fullLabel = courseTitle ? `${label}: ${courseTitle}` : label
  const Icon = saved ? BookmarkCheck : Bookmark

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`save-btn ${saved ? 'is-active' : ''} ${className}`.trim()}
        onClick={onClick}
        aria-pressed={saved}
        aria-label={fullLabel}
        title={saved ? 'Saved' : 'Save'}
      >
        <Icon size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`btn btn-secondary save-btn-full ${saved ? 'is-active' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={courseTitle ? fullLabel : undefined}
    >
      <Icon />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
