import { useId } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lightbulb, SearchX } from 'lucide-react'
import { recommendCourses } from '../lib/courses.js'
import CourseList from '../components/CourseList.jsx'
import { usePageTitle } from '../components/utils.js'
import { Empty, Meter, PageHead } from './parts.jsx'

const EXAMPLES = [
  'Python for data analysis',
  'UI/UX',
  'Cybersecurity basics',
  'Machine learning with Python',
  'Web development with JavaScript',
  'Cloud computing',
  'Project management',
  'Digital marketing',
]

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']

export default function Recommend() {
  usePageTitle('Recommendations')
  const uid = useId()
  const [sp, setSp] = useSearchParams()
  const goal = (sp.get('goal') || '').trim()
  const level = LEVEL_OPTIONS.includes(sp.get('level')) ? sp.get('level') : ''
  const results = goal ? recommendCourses(goal, { level: level || undefined, limit: 9 }) : []
  const byId = new Map(results.filter((r) => r.course).map((r) => [r.course.id, r]))

  const run = (nextGoal, nextLevel = level) => {
    const next = new URLSearchParams()
    if (nextGoal) next.set('goal', nextGoal)
    if (nextLevel) next.set('level', nextLevel)
    setSp(next)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    run(fd.get('goal')?.toString().trim() || '', fd.get('level')?.toString() || '')
  }

  return (
    <div className="pg-recommend">
      <PageHead
        title="Recommend"
        desc="Describe a goal in a few words. Courses are ranked by skill match, rating and level, in your browser."
      />

      <form className="pg-rec-form" onSubmit={onSubmit} key={`${goal}|${level}`}>
        <div className="pg-rec-fields">
          <div className="field pg-rec-goal">
            <label className="field-label" htmlFor={`${uid}-goal`}>
              Goal
            </label>
            <input
              id={`${uid}-goal`}
              name="goal"
              className="input"
              type="text"
              defaultValue={goal}
              placeholder="e.g. Python for data analysis"
              maxLength={200}
              required
            />
          </div>
          <div className="field pg-rec-level">
            <label className="field-label" htmlFor={`${uid}-level`}>
              Level
            </label>
            <select id={`${uid}-level`} name="level" className="select" defaultValue={level}>
              <option value="">Any level</option>
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary pg-rec-submit">
            Recommend
          </button>
        </div>
        <div className="pg-rec-examples">
          <span className="field-hint" id={`${uid}-ex`}>
            Try
          </span>
          <ul className="pg-tags" aria-labelledby={`${uid}-ex`}>
            {EXAMPLES.map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  className={`tag pg-tag-btn ${goal === ex ? 'is-active' : ''}`}
                  aria-pressed={goal === ex}
                  onClick={() => run(ex)}
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>

      <section className="pg-section" aria-live="polite" aria-label="Recommendations">
        {goal && results.length === 0 && (
          <Empty
            icon={SearchX}
            title="No matching courses"
            hint={`Nothing matched “${goal}”. Try other words, a broader topic, or any level.`}
          >
            <Link className="btn" to={`/search?q=${encodeURIComponent(goal)}`}>
              Search instead
            </Link>
          </Empty>
        )}

        {results.length > 0 && (
          <>
            <div className="pg-section-head">
              <h2 className="section-label">
                Matches for “{goal}”{level && ` · ${level}`} <span className="pg-count">· {results.length}</span>
              </h2>
            </div>
            <CourseList
              courses={results.map((r) => r.course).filter(Boolean)}
              label={`Recommendations for ${goal}`}
              extra={(course) => {
                const r = byId.get(course.id)
                if (!r) return null
                const pct = Math.round(Math.max(0, Math.min(1, Number(r.score) || 0)) * 100)
                return (
                  <span className="pg-rec-extra">
                    <span className="pg-rec-score">
                      <Meter percent={pct} label={`Match score for ${course.title}`} />
                      <span className="pg-mono">{pct}%</span>
                    </span>
                    {r.reason && <span className="pg-rec-reason">{r.reason}</span>}
                  </span>
                )
              }}
            />
          </>
        )}

        {!goal && (
          <Empty
            icon={Lightbulb}
            title="Start with a goal"
            hint="Type one above or pick an example. Nothing leaves your browser."
          />
        )}
      </section>
    </div>
  )
}
