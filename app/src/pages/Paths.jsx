import { Link } from 'react-router-dom'
import { getAllPaths } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PathCard from '../components/PathCard.jsx'
import { usePageTitle } from '../components/utils.js'

export default function Paths() {
  usePageTitle('Learning paths')
  const { user } = useAuth()
  const paths = getAllPaths()

  return (
    <div className="paths-page">
      <PageHeader
        title="Learning paths"
        icon="fa-route"
        subtitle="Step-by-step routes through courses from different platforms, picked to take you towards a goal."
      />
      {!user && (
        <p className="alert alert-info">
          <i className="fa-solid fa-circle-info" aria-hidden="true" />
          <span>
            <Link to="/login" state={{ from: '/paths' }}>
              Log in
            </Link>{' '}
            to track your progress through each path.
          </span>
        </p>
      )}
      {paths.length === 0 ? (
        <EmptyState icon="fa-route" title="No learning paths yet" />
      ) : (
        <ul className="path-grid" aria-label="Learning paths">
          {paths.map((p) => (
            <li key={p.id}>
              <PathCard path={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
