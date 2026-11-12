import { useId } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { recommendCourses } from '../lib/courses.js'
import CourseCard from '../components/CourseCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SkillChip from '../components/SkillChip.jsx'
import { usePageTitle } from '../components/utils.js'

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
    <div className="recommend-page">
      <PageHeader
        title="What do you want to learn?"
        icon="fa-wand-magic-sparkles"
        subtitle="Describe your goal in a few words. We match it against course skills, titles and categories, then favour well-rated courses at your level."
      />

      <form className="card recommend-form" onSubmit={onSubmit} key={`${goal}|${level}`}>
        <div className="recommend-fields">
          <div className="field recommend-goal">
            <label htmlFor={`${uid}-goal`}>Your learning goal</label>
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
          <div className="field recommend-level">
            <label htmlFor={`${uid}-level`}>Level (optional)</label>
            <select id={`${uid}-level`} name="level" className="select" defaultValue={level}>
              <option value="">Any level</option>
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary recommend-submit">
            <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" /> Recommend
          </button>
        </div>
        <div className="recommend-examples">
          <span className="field-hint" id={`${uid}-ex`}>
            Try:
          </span>
          <ul className="chip-list" aria-labelledby={`${uid}-ex`}>
            {EXAMPLES.map((ex) => (
              <li key={ex}>
                <SkillChip onClick={() => run(ex)} active={goal === ex}>
                  {ex}
                </SkillChip>
              </li>
            ))}
          </ul>
        </div>
      </form>

      <section aria-live="polite" aria-label="Recommendations">
        {goal && results.length === 0 && (
          <EmptyState
            icon="fa-face-meh"
            title="No matching courses yet"
            actions={
              <Link className="btn btn-outline" to={`/search?q=${encodeURIComponent(goal)}`}>
                Try a plain search instead
              </Link>
            }
          >
            <p>We could not match “{goal}” to any course. Try different words, a broader topic, or remove the level.</p>
          </EmptyState>
        )}

        {results.length > 0 && (
          <>
            <h2 className="results-heading">
              Top {results.length} {results.length === 1 ? 'match' : 'matches'} for “{goal}”
              {level && <span className="muted"> · {level}</span>}
            </h2>
            <ol className="rec-list">
              {results.map((r, i) => {
                const pct = Math.round(Math.max(0, Math.min(1, Number(r.score) || 0)) * 100)
                return (
                  <li key={r.course?.id || i} className="rec-item">
                    <div className="rec-score">
                      <div className="rec-score-head">
                        <span className="rec-rank">#{i + 1}</span>
                        <span className="rec-pct">{pct}% match</span>
                      </div>
                      <div
                        className="score-bar"
                        role="meter"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                        aria-label={`Match score for ${r.course?.title}`}
                      >
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      {r.reason && <p className="rec-reason">{r.reason}</p>}
                      {r.matchedSkills?.length > 0 && (
                        <ul className="chip-list" aria-label="Matched skills">
                          {r.matchedSkills.map((s) => (
                            <li key={s}>
                              <SkillChip variant="match">
                                <i className="fa-solid fa-check" aria-hidden="true" /> {s}
                              </SkillChip>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <CourseCard course={r.course} />
                  </li>
                )
              })}
            </ol>
          </>
        )}

        {!goal && (
          <EmptyState icon="fa-lightbulb" title="Tell us your goal">
            <p>Pick an example above or type your own. Recommendations are computed in your browser from the course list.</p>
          </EmptyState>
        )}
      </section>
    </div>
  )
}
