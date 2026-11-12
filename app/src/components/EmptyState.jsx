export default function EmptyState({ icon = 'fa-magnifying-glass', title, children, actions }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-icon" aria-hidden="true">
        <i className={`fa-solid ${icon}`} />
      </span>
      {title && <h2 className="empty-title">{title}</h2>}
      {children && <div className="empty-body">{children}</div>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  )
}
