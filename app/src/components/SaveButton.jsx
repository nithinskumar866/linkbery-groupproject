import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useSaved } from '../hooks/useSaved.js'
import { Bookmark, BookmarkCheck } from './icons.js'

/** Bookmark toggle. Guests are sent to /login with a message and brought back afterwards. */
export default function SaveButton({ courseId, courseTitle, variant = 'icon' }) {
  const { user } = useAuth()
  const { isSaved, toggleSaved } = useSaved()
  const navigate = useNavigate()
  const location = useLocation()
  const saved = Boolean(user) && isSaved(courseId)

  const goLogin = (message) =>
    navigate('/login', { state: { from: location, message: message || 'Log in to save courses to your profile.' } })

  const onClick = (e) => {
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

  const label = saved ? 'Remove from saved' : 'Save'
  const fullLabel = courseTitle ? `${label}: ${courseTitle}` : label
  const Icon = saved ? BookmarkCheck : Bookmark

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`btn btn-ghost btn-icon btn-sm action-btn save-btn ${saved ? 'is-active' : ''}`}
        onClick={onClick}
        aria-pressed={saved}
        aria-label={fullLabel}
        data-tip={saved ? 'Saved' : 'Save'}
      >
        <Icon />
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`btn save-btn-full ${saved ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={saved}
    >
      <Icon />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
