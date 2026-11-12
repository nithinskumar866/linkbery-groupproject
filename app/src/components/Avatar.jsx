import { initials, hueFor } from './utils.js'

/** User avatar image, or initials when there is none. */
export default function Avatar({ user, size = 40, className = '' }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) }
  if (user?.avatar) {
    return <img className={`avatar ${className}`} src={user.avatar} alt="" style={style} width={size} height={size} />
  }
  const name = user?.name || 'Guest'
  return (
    <span
      className={`avatar avatar-initials ${className}`}
      style={{ ...style, '--hue': user ? hueFor(name) : 30 }}
      aria-hidden="true"
    >
      {user ? initials(name) : <i className="fa-solid fa-user" />}
    </span>
  )
}
