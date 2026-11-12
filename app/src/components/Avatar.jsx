import { User } from './icons.js'
import { initials } from './utils.js'

/** Round user avatar: the image, or initials on a brand tint when there is none. */
export default function Avatar({ user, size = 40, className = '' }) {
  const style = { width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.4)) }
  if (user?.avatar) {
    return <img className={`avatar ${className}`.trim()} src={user.avatar} alt="" style={style} width={size} height={size} />
  }
  return (
    <span className={`avatar avatar-initials ${className}`.trim()} style={style} aria-hidden="true">
      {user ? initials(user.name || user.email) : <User size={Math.round(size * 0.55)} />}
    </span>
  )
}
