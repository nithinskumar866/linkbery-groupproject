import { Link } from 'react-router-dom'
import PageBand from '../components/PageBand.jsx'
import { usePageTitle } from '../components/utils.js'
import { Wrap } from './parts.jsx'

export default function NotFound({ title = 'Page not found', message }) {
  usePageTitle(title)
  return (
    <div className="pg-notfound">
      <PageBand
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Not found' }]}
        title={title}
        desc={message || 'This page does not exist or has moved.'}
      />
      <Wrap className="pg-page-body">
        <div className="pg-notfound-body">
          <p className="pg-notfound-code" aria-hidden="true">
            404
          </p>
          <p>Try one of these instead:</p>
          <div className="pg-notfound-actions">
            <Link className="btn btn-primary" to="/courses">
              Browse all courses
            </Link>
            <Link className="btn btn-secondary" to="/paths">
              Learning paths
            </Link>
            <Link className="btn btn-secondary" to="/">
              Go to the home page
            </Link>
          </div>
        </div>
      </Wrap>
    </div>
  )
}
