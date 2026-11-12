import { useId } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lightbulb, SearchX } from 'lucide-react'
import { recommendCourses } from '../lib/courses.js'
import CourseList from '../components/CourseList.jsx'
import PageBand from '../components/PageBand.jsx'
import { usePageTitle } from '../components/utils.js'
import { Empty, Meter, Wrap } from './parts.jsx'

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
      <PageBand
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Recommendations' }]}
        title="What do you want to learn?"
        desc="Describe a goal in a few words. Courses are ranked by how well their skills match, their rating and their level."
      >
        <form className="pg-rec-form" onSubmit={onSubmit} key={`${goal}|${level}`}>
          <div className="pg-rec-fields">
            <div className="field pg-rec-goal">
              <label className="field-label" htmlFor={`${uid}-goal`}>
                Your goal
              </label>
              <input
                id={`${uid}-goal`}
                name="goal"
                className="input pg-input-lg"
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
              <select id={`${uid}-level`} name="level" className="select pg-input-lg" defaultValue={level}>
                <option value="">Any level</option>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary pg-btn-lg pg-rec-submit">
              Recommend courses
            </button>
          </div>
          <div className="pg-rec-examples">
            <span className="pg-rec-try" id={`${uid}-ex`}>
              Try:
            </span>
            <ul className="pg-chips" aria-labelledby={`${uid}-ex`}>
              {EXAMPLES.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    className={`pg-chip ${goal === ex ? 'is-active' : ''}`}
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
      </PageBand>

      <Wrap className="pg-page-body">
        <section aria-live="polite" aria-label="Recommendations">
          {goal && results.length === 0 && (
            <Empty
              icon={SearchX}
              title="No matching courses"
              hint={`Nothing matched “${goal}”. Try other words, a broader topic, or any level.`}
            >
              <Link className="btn btn-secondary" to={`/search?q=${encodeURIComponent(goal)}`}>
                Search instead
              </Link>
            </Empty>
          )}

          {results.length > 0 && (
            <>
              <p className="pg-result-count">
                <strong>{results.length}</strong> {results.length === 1 ? 'course matches' : 'courses match'} “{goal}”
                {level && ` at ${level.toLowerCase()} level`}
              </p>
              <CourseList
                courses={results.map((r) => r.course).filter(Boolean)}
                variant="list"
                label={`Recommendations for ${goal}`}
                extra={(course) => {
                  const r = byId.get(course.id)
                  if (!r) return null
                  const pct = Math.round(Math.max(0, Math.min(1, Number(r.score) || 0)) * 100)
                  return (
                    <span className="pg-rec-extra">
                      <span className="pg-rec-score">
                        <span className="pg-rec-score-label">Match</span>
                        <Meter percent={pct} label={`Match score for ${course.title}`} tone="green" />
                        <span className="pg-rec-score-pct">{pct}%</span>
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
              hint="Type one above or pick an example. Everything runs in your browser."
            />
          )}
        </section>
      </Wrap>
    </div>
  )
}
