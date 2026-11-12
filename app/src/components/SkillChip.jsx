import { Link } from 'react-router-dom'

/**
 * A small pill. Renders as a link (to), a removable button (onRemove),
 * a clickable button (onClick) or plain text.
 */
export default function SkillChip({ children, to, onClick, onRemove, active = false, variant = '', title }) {
  const cls = `chip ${active ? 'chip-active' : ''} ${variant ? `chip-${variant}` : ''}`.trim()
  if (onRemove) {
    return (
      <button type="button" className={`${cls} chip-removable`} onClick={onRemove} title={title}>
        <span>{children}</span>
        <i className="fa-solid fa-xmark" aria-hidden="true" />
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
