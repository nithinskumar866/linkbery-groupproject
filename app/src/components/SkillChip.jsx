import { Link } from 'react-router-dom'
import { X } from './icons.js'

/**
 * A .tag. Renders as a link (to), a removable button (onRemove),
 * a toggle button (onClick) or plain text.
 * variant: "match" (green, e.g. matched or shared skills), "outline" (same as default).
 */
export default function SkillChip({ children, to, onClick, onRemove, active = false, variant = '', title }) {
  const cls = ['tag', active ? 'is-active' : '', variant === 'match' ? 'tag-green' : ''].filter(Boolean).join(' ')
  if (onRemove) {
    return (
      <button type="button" className={`${cls} tag-removable`} onClick={onRemove} title={title}>
        <span>{children}</span>
        <X aria-hidden="true" />
        <span className="visually-hidden">(remove)</span>
      </button>
    )
  }
  if (to) {
    return (
      <Link className={cls} to={to} title={title}>
        {children}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} aria-pressed={active} title={title}>
        {children}
      </button>
    )
  }
  return (
    <span className={cls} title={title}>
      {children}
    </span>
  )
}
