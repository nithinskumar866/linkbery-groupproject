import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useSaved } from '../hooks/useSaved.js'

/** Bookmark toggle. Guests are sent to /login with a message and brought back afterwards. */
export default function SaveButton({ courseId, courseTitle, variant = 'icon' }) {
  const { user } = useAuth()
  const { isSaved, toggleSaved } = useSaved()
  const navigate = useNavigate()
  const location = useLocation()
  const saved = Boolean(user) && isSaved(courseId)

  const goLogin = (message) =>
    navigate('/login', { state: { from: location, message: message || 'Log in to save courses to your profile.' } })

  const onClick = () => {
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
  const icon = saved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`icon-btn save-btn ${saved ? 'is-saved' : ''}`}
        onClick={onClick}
        aria-pressed={saved}
        aria-label={fullLabel}
        title={label}
      >
        <i className={icon} aria-hidden="true" />
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`btn ${saved ? 'btn-outline is-saved' : 'btn-outline'} save-btn-full`}
      onClick={onClick}
      aria-pressed={saved}
    >
      <i className={icon} aria-hidden="true" />
      {saved ? 'Saved' : 'Save course'}
    </button>
  )
}
