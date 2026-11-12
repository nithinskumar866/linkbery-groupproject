import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Columns2, Link2, X } from 'lucide-react'
import { getCompareSummary } from '../lib/courses.js'
import { useCompare } from '../hooks/useCompare.js'
import CourseThumb from '../components/CourseThumb.jsx'
import PageBand from '../components/PageBand.jsx'
import PriceBadge from '../components/PriceBadge.jsx'
import { showToast } from '../components/toast.js'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import { Empty, Note, Wrap } from './parts.jsx'
import { byline } from './format.js'
import { ICON } from './iconProps.js'

const parseIds = (raw) => [...new Set((raw || '').split(',').map((s) => s.trim()).filter(Boolean))]

function Best({ show, children }) {
  return (
    <span className="pg-best">
      {children}
      {show && <span className="badge pg-badge-best">Best</span>}
    </span>
  )
}

const CRUMBS = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Compare' },
]

export default function Compare() {
  usePageTitle('Compare courses')
  const [sp, setSp] = useSearchParams()
  const navigate = useNavigate()
  const { compareIds, removeFromCompare, clearCompare, addToCompare, max } = useCompare()
  const [copied, setCopied] = useState(false)

  const shared = sp.has('ids')
  const ids = shared ? parseIds(sp.get('ids')).slice(0, max) : compareIds
  const { courses, sharedSkills = [], uniqueSkills = {}, best = {} } = getCompareSummary(ids)
  const sharedSet = new Set(sharedSkills)
  const sameAsStored =
    shared && courses.length === compareIds.length && courses.every((c) => compareIds.includes(c.id))

  const remove = (id) => {
    if (shared) {
      const next = courses.map((c) => c.id).filter((x) => x !== id)
      // Removing the last shared course falls back to the user's own stored list.
      setSp(next.length ? { ids: next.join(',') } : {}, { replace: true })
    } else {
      removeFromCompare(id)
    }
  }

  const useThisList = () => {
    clearCompare()
    try {
      courses.forEach((c) => addToCompare(c.id))
      showToast('Comparison list updated.', { type: 'success' })
    } catch (err) {
      showToast(err?.message || 'Could not use this list.', { type: 'error' })
    }
    navigate('/compare', { replace: true })
  }

  const shareUrl = `${window.location.origin}/compare?ids=${courses.map((c) => encodeURIComponent(c.id)).join(',')}`
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast(`Copy this link: ${shareUrl}`, { type: 'info', timeout: 10000 })
    }
  }

  const band = (
    <PageBand
      crumbs={CRUMBS}
      title="Compare courses"
      desc={`Put up to ${max} courses side by side on price, length, level, rating and the skills they teach.`}
    >
      {!shared && courses.length > 0 && (
        <div className="pg-band-actions">
          <button type="button" className="btn btn-secondary" onClick={copyLink}>
            {copied ? <Check {...ICON} /> : <Link2 {...ICON} />}
            {copied ? 'Link copied' : 'Copy share link'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={clearCompare}>
            Clear all
          </button>
        </div>
      )}
    </PageBand>
  )

  if (courses.length === 0) {
    return (
      <div className="pg-compare">
        {band}
        <Wrap className="pg-page-body">
          <Empty
            icon={Columns2}
            title={shared ? 'None of these courses were found' : 'Nothing to compare yet'}
            hint={`Use “+ Compare” on any course to add it here. You can compare up to ${max}.`}
          >
            <Link className="btn btn-primary" to="/courses">
              Browse courses
            </Link>
          </Empty>
        </Wrap>
      </div>
    )
  }

  const rows = [
    ['Provider', (c) => c.provider],
    ['Platform', (c) => c.platform],
    ['Price', (c) => (c.price ? <PriceBadge price={c.price} /> : null)],
    [
      'Rating',
      (c) =>
        formatRating(c.rating) ? (
          <Best show={best.rating === c.id}>
            <span>
              <span className="pg-star" aria-hidden="true">
                ★
              </span>{' '}
              {formatRating(c.rating)}
              <span className="visually-hidden"> out of 5</span>
            </span>
          </Best>
        ) : (
          <span className="pg-dim">No rating yet</span>
        ),
    ],
    [
      'Reviews',
      (c) =>
        c.reviewCount ? (
          <Best show={best.reviews === c.id}>
            <span>{formatNumber(c.reviewCount)}</span>
          </Best>
        ) : null,
    ],
    ['Level', (c) => c.level],
    ['Type', (c) => c.type],
    ['Duration', (c) => c.duration],
  ]

  return (
    <div className="pg-compare">
      {band}
      <Wrap className="pg-page-body">
        {shared && (
          <div className="alert alert-info pg-note pg-compare-shared">
            <Link2 {...ICON} />
            <div className="pg-note-body">
              <strong>Shared comparison.</strong>
              {sameAsStored ? ' It matches your list.' : ' Your own list is unchanged until you choose to use this one.'}
            </div>
            {!sameAsStored && (
              <button type="button" className="btn btn-primary" onClick={useThisList}>
                Use this list
              </button>
            )}
          </div>
        )}

        {courses.length === 1 && (
          <Note type="warn">
            Add at least one more course to compare. <Link to="/courses">Browse courses</Link>
          </Note>
        )}

        <div className="pg-table-scroll pg-compare-scroll" role="region" aria-label="Comparison table" tabIndex={0}>
          <table className="pg-table pg-compare-table">
            <caption className="visually-hidden">Course comparison</caption>
            <thead>
              <tr>
                <th scope="col" className="pg-sticky-col">
                  <span className="visually-hidden">Attribute</span>
                </th>
                {courses.map((c) => (
                  <th key={c.id} scope="col" className="pg-compare-course">
                    <div className="pg-compare-thumb">
                      <CourseThumb course={c} size="sm" />
                      <button
                        type="button"
                        className="pg-compare-remove"
                        onClick={() => remove(c.id)}
                        aria-label={`Remove ${c.title} from comparison`}
                      >
                        <X {...ICON} size={16} />
                      </button>
                    </div>
                    <span className="pg-compare-by">{byline(c)}</span>
                    <Link to={`/courses/${encodeURIComponent(c.id)}`} className="pg-compare-title">
                      {c.title}
                    </Link>
                    {c.url && (
                      <a className="pg-compare-go" href={c.url} target="_blank" rel="noopener noreferrer">
                        Go to course <span aria-hidden="true">↗</span>
                        <span className="visually-hidden"> on {c.platform} (opens in a new tab)</span>
                      </a>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, get]) => (
                <tr key={label}>
                  <th scope="row" className="pg-sticky-col">
                    {label}
                  </th>
                  {courses.map((c) => {
                    const v = get(c)
                    return <td key={c.id}>{v ?? <span className="pg-dim">Not listed</span>}</td>
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row" className="pg-sticky-col">
                  Skills
                </th>
                {courses.map((c) => (
                  <td key={c.id}>
                    {c.skills?.length ? (
                      <ul className="pg-tags">
                        {c.skills.map((s) => (
                          <li key={s}>
                            {sharedSet.has(s) ? (
                              <span className="tag pg-tag-shared">
                                <Check {...ICON} size={12} />
                                {s}
                                <span className="visually-hidden"> (taught by every course here)</span>
                              </span>
                            ) : (
                              <span className="tag">{s}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="pg-dim">Not listed</span>
                    )}
                  </td>
                ))}
              </tr>
              {courses.length > 2 && (
                <tr>
                  <th scope="row" className="pg-sticky-col">
                    Only here
                  </th>
                  {courses.map((c) => {
                    const only = uniqueSkills[c.id] || []
                    return (
                      <td key={c.id}>
                        {only.length ? only.join(', ') : <span className="pg-dim">None</span>}
                      </td>
                    )
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {courses.length > 1 && (
          <div className="pg-compare-legend">
            <p>
              <span className="tag pg-tag-shared">
                <Check {...ICON} size={12} />
                Green
              </span>{' '}
              skills are taught by every course in the table
              {sharedSkills.length > 0 ? ` (${sharedSkills.length} in common).` : '. These courses have none in common.'}
            </p>
            <p>
              <span className="badge pg-badge-best">Best</span> marks the highest rating and the most reviews.
            </p>
          </div>
        )}
      </Wrap>
    </div>
  )
}
