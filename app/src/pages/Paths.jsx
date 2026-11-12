import { Link } from 'react-router-dom'
import { Route } from 'lucide-react'
import { getAllPaths } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { usePageTitle } from '../components/utils.js'
import { Empty, Note, PageHead, PathRow, SectionHead } from './parts.jsx'

export default function Paths() {
  usePageTitle('Learning paths')
  const { user } = useAuth()
  const paths = getAllPaths()

  return (
    <div className="pg-paths">
      <PageHead
        title="Learning paths"
        desc="Ordered courses from different platforms that lead to one goal, such as a first data analyst job."
      />
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
        <section className="pg-section pg-section-first" aria-labelledby="h-all-paths">
          <SectionHead id="h-all-paths" label="Paths" count={paths.length} />
          <ul className="pg-rows" aria-label="Learning paths">
            {paths.map((p) => (
              <li key={p.id}>
                <PathRow path={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
