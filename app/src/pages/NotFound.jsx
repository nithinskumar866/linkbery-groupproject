import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { usePageTitle } from '../components/utils.js'

export default function NotFound({ title = 'Page not found', message }) {
  usePageTitle(title)
  return (
    <div className="narrow-page">
      <EmptyState
        icon="fa-compass"
        title={title}
        actions={
          <>
            <Link className="btn btn-primary" to="/">
              Go home
            </Link>
            <Link className="btn btn-outline" to="/courses">
              Browse courses
            </Link>
          </>
        }
      >
        <p className="error-code" aria-hidden="true">404</p>
        <p>{message || 'The page you were looking for does not exist or has moved.'}</p>
      </EmptyState>
    </div>
  )
}
