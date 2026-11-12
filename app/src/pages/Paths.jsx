import { Link } from 'react-router-dom'
import { Route } from 'lucide-react'
import { getAllPaths } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import PageBand from '../components/PageBand.jsx'
import { usePageTitle } from '../components/utils.js'
import { Empty, Note, PathTile, Wrap } from './parts.jsx'

export default function Paths() {
  usePageTitle('Learning paths')
  const { user } = useAuth()
  const paths = getAllPaths()

  return (
    <div className="pg-paths">
      <PageBand
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Learning paths' }]}
        title="Learning paths"
        desc="Courses from different platforms, put in an order that leads to one goal, such as a first data analyst job."
      />
      <Wrap className="pg-page-body">
        {!user && (
          <Note>
            <Link to="/login" state={{ from: '/paths' }}>
              Log in
            </Link>{' '}
            to track your progress through a path.
          </Note>
        )}
        {paths.length === 0 ? (
          <Empty icon={Route} title="No learning paths yet" />
        ) : (
          <>
            <p className="pg-result-count">
              <strong>{paths.length}</strong> {paths.length === 1 ? 'path' : 'paths'}
            </p>
            <ul className="pg-path-grid" aria-label="Learning paths">
              {paths.map((p) => (
                <li key={p.id}>
                  <PathTile path={p} headingLevel={2} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Wrap>
    </div>
  )
}
