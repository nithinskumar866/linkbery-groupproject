import { Link } from 'react-router-dom'
import { usePageTitle } from '../components/utils.js'

export default function NotFound({ title = 'Page not found', message }) {
  usePageTitle(title)
  return (
    <div className="pg-notfound">
      <div className="empty">
        <p className="pg-notfound-code" aria-hidden="true">
          404
        </p>
        <h1 className="pg-empty-title pg-notfound-title">{title}</h1>
        <p className="pg-empty-hint">{message || 'This page does not exist or has moved.'}</p>
        <div className="pg-empty-actions">
          <Link className="btn btn-primary" to="/">
            Go home
          </Link>
          <Link className="btn" to="/courses">
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  )
}
