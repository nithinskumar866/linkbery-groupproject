import { Link, useNavigate } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { useAuth } from '../hooks/useAuth.js'
import { useSaved } from '../hooks/useSaved.js'
import Avatar from '../components/Avatar.jsx'
import CourseGrid from '../components/CourseGrid.jsx'
import EmptyState from '../components/EmptyState.jsx'
import MyLearning from '../components/MyLearning.jsx'
import { formatDate, usePageTitle } from '../components/utils.js'

export default function Profile() {
  usePageTitle('My profile')
  const { user, logOut } = useAuth()
  const { savedIds } = useSaved()
  const navigate = useNavigate()
  if (!user) return null // ProtectedRoute handles redirect

  const saved = (savedIds || []).map((id) => getCourseById(id)).filter(Boolean)
  const platforms = new Set(saved.map((c) => c.platform).filter(Boolean))
  const since = formatDate(user.createdAt)

  const onLogout = async () => {
    await logOut()
    navigate('/')
  }

  return (
    <div className="profile-page">
      <section className="card profile-card">
        <Avatar user={user} size={96} />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="muted profile-email">{user.email}</p>
          <p className="profile-role">
            <span className="tag">{user.role || 'Student'}</span>
            {since && <span className="muted">Member since {since}</span>}
          </p>
        </div>
        <dl className="profile-stats">
          <div>
            <dt>Saved courses</dt>
            <dd>{saved.length}</dd>
          </div>
          <div>
            <dt>Platforms</dt>
            <dd>{platforms.size}</dd>
          </div>
        </dl>
        <div className="profile-actions">
          <Link className="btn btn-primary" to="/profile/edit">
            <i className="fa-solid fa-user-pen" aria-hidden="true" /> Edit profile
          </Link>
          <button type="button" className="btn btn-outline" onClick={onLogout}>
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Log out
          </button>
        </div>
      </section>

      <MyLearning />

      <section className="home-section" aria-labelledby="h-saved">
        <div className="section-head">
          <h2 id="h-saved">
            <i className="fa-solid fa-bookmark" aria-hidden="true" /> Saved courses
          </h2>
          {saved.length > 0 && <Link to="/courses">Find more</Link>}
        </div>
        <CourseGrid
          courses={saved}
          label="Saved courses"
          empty={
            <EmptyState
              icon="fa-bookmark"
              title="No saved courses yet"
              actions={
                <>
                  <Link className="btn btn-primary" to="/courses">
                    Browse courses
                  </Link>
                  <Link className="btn btn-outline" to="/recommend">
                    Get recommendations
                  </Link>
                </>
              }
            >
              <p>
                Tap the <i className="fa-regular fa-bookmark" aria-hidden="true" />
                <span className="visually-hidden">bookmark</span> icon on any course to keep it here.
              </p>
            </EmptyState>
          }
        />
      </section>
    </div>
  )
}
