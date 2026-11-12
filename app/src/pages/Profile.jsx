import { useId, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bookmark, CalendarClock, CircleCheck, CirclePlay, LogOut, Pencil, Route } from 'lucide-react'
import { getCourseById } from '../lib/courses.js'
import { getAllPaths } from '../lib/paths.js'
import { STATUSES } from '../lib/progress.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import { useSaved } from '../hooks/useSaved.js'
import Avatar from '../components/Avatar.jsx'
import CourseList from '../components/CourseList.jsx'
import { STATUS_META } from '../components/statusMeta.js'
import { formatDate, usePageTitle } from '../components/utils.js'
import { Empty, PathTile, Wrap } from './parts.jsx'
import { ICON } from './iconProps.js'

const TABS = ['saved', ...STATUSES, 'paths']
const LABEL = { saved: 'Saved', paths: 'Paths' }
const tabLabel = (t) => LABEL[t] || STATUS_META[t]?.label || t

const EMPTY = {
  saved: { icon: Bookmark, title: 'No saved courses', hint: 'Use Save on any course to keep it here.' },
  planning: { icon: CalendarClock, title: 'Nothing planned', hint: 'Set a course to “Planning” on its page to line it up.' },
  'in-progress': { icon: CirclePlay, title: 'Nothing in progress', hint: 'Courses you are taking show up here.' },
  completed: { icon: CircleCheck, title: 'Nothing completed yet', hint: 'Finished courses show up here.' },
  paths: { icon: Route, title: 'No paths started', hint: 'Set a status on any course in a learning path to start tracking it.' },
}

export default function Profile() {
  usePageTitle('My profile')
  const uid = useId()
  const { user, logOut } = useAuth()
  const { savedIds } = useSaved()
  const { progress } = useProgress()
  const navigate = useNavigate()
  const [sp, setSp] = useSearchParams()
  const tabRefs = useRef({})
  if (!user) return null // ProtectedRoute handles the redirect

  const tab = TABS.includes(sp.get('tab')) ? sp.get('tab') : 'saved'
  const setTab = (t) => setSp(t === 'saved' ? {} : { tab: t }, { replace: true })

  const saved = (savedIds || []).map((id) => getCourseById(id)).filter(Boolean)
  // Newest first within each status.
  const entries = Object.entries(progress || {}).sort((a, b) =>
    String(b[1]?.updatedAt || '').localeCompare(String(a[1]?.updatedAt || '')),
  )
  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [
      s,
      entries
        .filter(([, v]) => v?.status === s)
        .map(([id]) => getCourseById(id))
        .filter(Boolean),
    ]),
  )
  const startedPaths = getAllPaths().filter((p) => p.steps.some((st) => progress?.[st.courseId]?.status))
  const counts = {
    saved: saved.length,
    ...Object.fromEntries(STATUSES.map((s) => [s, byStatus[s].length])),
    paths: startedPaths.length,
  }
  const since = formatDate(user.createdAt)

  const onLogout = async () => {
    await logOut()
    navigate('/')
  }

  const onKeyDown = (e) => {
    const i = TABS.indexOf(tab)
    let next = null
    if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length]
    if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length]
    if (e.key === 'Home') next = TABS[0]
    if (e.key === 'End') next = TABS[TABS.length - 1]
    if (next) {
      e.preventDefault()
      setTab(next)
      tabRefs.current[next]?.focus()
    }
  }

  const empty = EMPTY[tab]
  const emptyNode = (
    <Empty icon={empty.icon} title={empty.title} hint={empty.hint}>
      <Link className="btn btn-secondary" to={tab === 'paths' ? '/paths' : '/courses'}>
        {tab === 'paths' ? 'Browse learning paths' : 'Browse courses'}
      </Link>
    </Empty>
  )

  return (
    <div className="pg-profile">
      <section className="pg-band pg-profile-band" aria-labelledby="profile-name">
        <Wrap>
          <nav className="pg-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <span aria-current="page">Profile</span>
              </li>
            </ol>
          </nav>
          <div className="card pg-profile-card">
            <Avatar user={user} size={72} />
            <div className="pg-profile-id">
              <h1 id="profile-name" className="pg-profile-name">
                {user.name}
              </h1>
              <p className="pg-profile-meta">
                <span>{user.email}</span>
                {since && <span>Member since {since}</span>}
              </p>
            </div>
            <div className="pg-profile-actions">
              <Link className="btn btn-secondary" to="/profile/edit">
                <Pencil {...ICON} /> Edit profile
              </Link>
              <button type="button" className="btn btn-secondary" onClick={onLogout}>
                <LogOut {...ICON} /> Log out
              </button>
            </div>
          </div>
        </Wrap>
      </section>

      <Wrap className="pg-page-body">
        <div className="pg-tabs-scroll">
          <div className="pg-tabs" role="tablist" aria-label="Your courses" onKeyDown={onKeyDown}>
            {TABS.map((t) => {
              const selected = tab === t
              return (
                <button
                  key={t}
                  ref={(el) => {
                    tabRefs.current[t] = el
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${t}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className={`pg-tab ${selected ? 'is-active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {tabLabel(t)}
                  <span className="pg-tab-count">{counts[t]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`} className="pg-tab-panel">
          {tab === 'paths' ? (
            startedPaths.length === 0 ? (
              emptyNode
            ) : (
              <ul className="pg-path-grid">
                {startedPaths.map((p) => (
                  <li key={p.id}>
                    <PathTile path={p} headingLevel={2} />
                  </li>
                ))}
              </ul>
            )
          ) : (
            <CourseList
              courses={tab === 'saved' ? saved : byStatus[tab]}
              variant="grid"
              label={tabLabel(tab)}
              empty={emptyNode}
            />
          )}
        </div>
      </Wrap>
    </div>
  )
}
