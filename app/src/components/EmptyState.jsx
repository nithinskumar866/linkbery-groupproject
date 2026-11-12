import { Search, renderIcon } from './icons.js'

/** Centred empty state. `icon` is a Lucide icon from icons.js (or an element). */
export default function EmptyState({ icon = Search, title, children, actions }) {
  return (
    <div className="empty" role="status">
      <span className="empty-icon" aria-hidden="true">
        {renderIcon(icon, { size: 24 }) || renderIcon(Search, { size: 24 })}
      </span>
      {title && <h2 className="empty-title">{title}</h2>}
      {children && <div className="empty-body">{children}</div>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  )
}
