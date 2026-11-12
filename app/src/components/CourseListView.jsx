import { useId, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getFacetCounts, searchCourses } from '../lib/courses.js'
import CourseList from './CourseList.jsx'
import EmptyState from './EmptyState.jsx'
import FilterPanel from './FilterPanel.jsx'
import PageBand from './PageBand.jsx'
import Pagination from './Pagination.jsx'
import SkillChip from './SkillChip.jsx'
import { LayoutGrid, List, ListFilter, Search, SlidersHorizontal, X } from './icons.js'
import { EMPTY_FILTERS, PAGE_SIZE, countActive, readFilters, readPage, toSearchOptions, writeFilters } from './filterParams.js'
import { useDialog } from './useDialog.js'
import { SORTS, categoryName } from './utils.js'

const EXAMPLES = ['Python', 'Machine Learning', 'UI/UX', 'SQL', 'Cybersecurity', 'Project Management']

/**
 * Shared course listing used by /courses, /category/:slug and /search:
 * page band, filter column (a slide-over sheet on small screens), toolbar with
 * result range, active-filter chips, sort and list/grid toggle, results and
 * pagination. Filters, sort and page all live in the URL.
 */
export default function CourseListView({ title, subtitle, breadcrumbs, fixedCategory, searchMode = false }) {
  const uid = useId()
  const [sp, setSp] = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [view, setView] = useState('list')
  const sheetRef = useRef(null)
  const topRef = useRef(null)
  const filters = readFilters(sp)
  const ignoreCategories = Boolean(fixedCategory)
  const activeCount = countActive(filters, { ignoreCategories })
  useDialog(sheetRef, sheetOpen, () => setSheetOpen(false))

  // Any filter change drops `page` (writeFilters never writes it), so it resets to 1.
  const update = (next, replace = true) => setSp(writeFilters(next), { replace })
  const clearFilters = () => update({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })
  const clearAll = () => update({ ...EMPTY_FILTERS, sort: filters.sort })

  // searchCourses / getFacetCounts take the text as `query`, not `q` (CONTRACT §3)
  const options = toSearchOptions(filters, { fixedCategory })
  const results = searchCourses(options)
  const counts = getFacetCounts(options)
  const nothingAsked = searchMode && !filters.q && activeCount === 0

  const total = results.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(readPage(sp), pageCount)
  const start = (page - 1) * PAGE_SIZE
  const shown = results.slice(start, start + PAGE_SIZE)

  const setPage = (p) => {
    const next = writeFilters(filters)
    if (p > 1) next.set('page', String(p))
    setSp(next)
    const top = topRef.current
    if (top) {
      const y = top.getBoundingClientRect().top + window.scrollY - 96
      window.scrollTo({ top: Math.max(0, y) })
    }
  }

  const onSearch = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim() || ''
    update({ ...filters, q }, false)
  }

  const activeTags = [
    ...(ignoreCategories
      ? []
      : filters.categories.map((v) => ({ key: `c-${v}`, label: categoryName(v), remove: { categories: filters.categories.filter((x) => x !== v) } }))),
    ...filters.levels.map((v) => ({ key: `l-${v}`, label: v, remove: { levels: filters.levels.filter((x) => x !== v) } })),
    ...filters.platforms.map((v) => ({ key: `p-${v}`, label: v, remove: { platforms: filters.platforms.filter((x) => x !== v) } })),
    ...filters.price.map((v) => ({ key: `$-${v}`, label: v, remove: { price: filters.price.filter((x) => x !== v) } })),
    ...filters.skills.map((v) => ({ key: `s-${v}`, label: `Skill: ${v}`, remove: { skills: filters.skills.filter((x) => x !== v) } })),
    ...(filters.minRating > 0 ? [{ key: 'r', label: `★ ${filters.minRating}+`, remove: { minRating: 0 } }] : []),
  ]
  const hasChips = activeTags.length > 0 || Boolean(filters.q)

  // Breadcrumbs start with Home; older callers passed them without it.
  const given = breadcrumbs?.length ? breadcrumbs : [{ label: searchMode ? 'Search' : 'Courses' }]
  const crumbs = given[0]?.to === '/' ? given : [{ label: 'Home', to: '/' }, ...given]
  const bandTitle = searchMode && filters.q ? `Results for “${filters.q}”` : title
  const panelId = `${uid}-filters`
  const courseWord = (n) => (n === 1 ? 'course' : 'courses')

  const panel = (inSheet) => (
    <FilterPanel
      id={inSheet ? `${panelId}-sheet` : panelId}
      filters={filters}
      onChange={(next) => update(next)}
      onClear={clearFilters}
      activeCount={activeCount}
      counts={counts}
      hideCategories={ignoreCategories}
      hideHead={inSheet}
    />
  )

  return (
    <div className="list-page">
      <PageBand crumbs={crumbs} title={bandTitle} desc={subtitle}>
        {searchMode && (
          <form className="list-search" role="search" onSubmit={onSearch}>
            <label htmlFor={`${uid}-q`} className="visually-hidden">
              Search courses
            </label>
            <Search className="list-search-icon" aria-hidden="true" />
            <input
              key={filters.q}
              id={`${uid}-q`}
              name="q"
              type="search"
              className="input list-search-input"
              defaultValue={filters.q}
              placeholder="Course, skill, provider or platform"
              enterKeyHint="search"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        )}
      </PageBand>

      <div className="container list-layout">
        <aside className="list-filters" aria-label="Filters">
          {panel(false)}
        </aside>

        <section className="list-main" aria-label="Results" ref={topRef}>
          <div className="list-toolbar">
            <p className="list-count" aria-live="polite">
              {nothingAsked ? (
                'Type something to search'
              ) : total === 0 ? (
                'No courses found'
              ) : (
                <>
                  Showing{' '}
                  <strong>
                    {start + 1}–{start + shown.length}
                  </strong>{' '}
                  of {total} {courseWord(total)}
                </>
              )}
            </p>
            <div className="list-toolbar-right">
              <button
                type="button"
                className="btn btn-secondary btn-sm list-filters-toggle"
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                onClick={() => setSheetOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeCount > 0 && <span className="list-filters-count">{activeCount}</span>}
              </button>
              <label htmlFor={`${uid}-sort`} className="list-sort-label">
                Sort by
              </label>
              <select
                id={`${uid}-sort`}
                className="select list-sort"
                value={filters.sort}
                onChange={(e) => update({ ...filters, sort: e.target.value })}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value === 'relevance' ? 'Most relevant' : s.label}
                  </option>
                ))}
              </select>
              <div className="view-toggle" role="group" aria-label="Layout">
                <button
                  type="button"
                  className={`view-toggle-btn ${view === 'list' ? 'is-active' : ''}`}
                  aria-pressed={view === 'list'}
                  aria-label="Show as list"
                  data-tip="List"
                  onClick={() => setView('list')}
                >
                  <List />
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${view === 'grid' ? 'is-active' : ''}`}
                  aria-pressed={view === 'grid'}
                  aria-label="Show as grid"
                  data-tip="Grid"
                  onClick={() => setView('grid')}
                >
                  <LayoutGrid />
                </button>
              </div>
            </div>
          </div>

          {hasChips && (
            <div className="list-chips">
              <ul className="list-chips-list" aria-label="Active filters">
                {filters.q && (
                  <li>
                    <button type="button" className="pill pill-chip" onClick={() => update({ ...filters, q: '' })}>
                      “{filters.q}”
                      <X aria-hidden="true" />
                      <span className="visually-hidden">Remove search text</span>
                    </button>
                  </li>
                )}
                {activeTags.map((t) => (
                  <li key={t.key}>
                    <button type="button" className="pill pill-chip" onClick={() => update({ ...filters, ...t.remove })}>
                      {t.label}
                      <X aria-hidden="true" />
                      <span className="visually-hidden">Remove filter</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="filter-clear" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}

          {nothingAsked ? (
            <EmptyState icon={Search} title="What do you want to learn?">
              <p>Search by title, skill, provider or platform.</p>
              <ul className="tag-list tag-list-center">
                {EXAMPLES.map((s) => (
                  <li key={s}>
                    <SkillChip to={`/search?q=${encodeURIComponent(s)}`}>{s}</SkillChip>
                  </li>
                ))}
              </ul>
            </EmptyState>
          ) : (
            <>
              <CourseList
                courses={shown}
                variant={view}
                label={title}
                empty={
                  <EmptyState
                    icon={ListFilter}
                    title="No courses match"
                    actions={
                      <>
                        {(activeCount > 0 || filters.q) && (
                          <button type="button" className="btn btn-secondary btn-sm" onClick={clearAll}>
                            Clear filters
                          </button>
                        )}
                        <Link className="btn btn-ghost btn-sm" to="/recommend">
                          Get recommendations
                        </Link>
                      </>
                    }
                  >
                    <p>Remove a filter or try a broader term.</p>
                  </EmptyState>
                }
              />
              <Pagination page={page} pageCount={pageCount} onChange={setPage} label={`${title} pages`} />
            </>
          )}
        </section>
      </div>

      {sheetOpen && (
        <div className="sheet-root">
          <div className="sheet-overlay" onClick={() => setSheetOpen(false)} aria-hidden="true" />
          <div ref={sheetRef} className="sheet sheet-left filter-sheet" role="dialog" aria-modal="true" aria-labelledby={`${uid}-sheet-title`}>
            <div className="sheet-head">
              <h2 className="filter-panel-title" id={`${uid}-sheet-title`}>
                Filters
              </h2>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setSheetOpen(false)} aria-label="Close filters">
                <X />
              </button>
            </div>
            <div className="sheet-body">{panel(true)}</div>
            <div className="sheet-foot">
              <button type="button" className="btn btn-secondary" onClick={clearFilters} disabled={activeCount === 0}>
                Clear all
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setSheetOpen(false)}>
                Show {total} {courseWord(total)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
