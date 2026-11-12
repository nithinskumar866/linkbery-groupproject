import { useId, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getFacetCounts, searchCourses } from '../lib/courses.js'
import CourseList from './CourseList.jsx'
import EmptyState from './EmptyState.jsx'
import FilterPanel from './FilterPanel.jsx'
import PageHeader from './PageHeader.jsx'
import SkillChip from './SkillChip.jsx'
import { LayoutGrid, List, ListFilter, Search, SlidersHorizontal, X } from './icons.js'
import { EMPTY_FILTERS, countActive, readFilters, toSearchOptions, writeFilters } from './filterParams.js'
import { useDialog } from './useDialog.js'
import { SORTS, categoryName } from './utils.js'

const EXAMPLES = ['Python', 'Machine Learning', 'UI/UX', 'SQL', 'Cybersecurity', 'Project Management']

/**
 * Shared course list: filter column + toolbar + rows, all state in the URL.
 * Used by /courses, /category/:slug and /search. `icon` is accepted for compatibility.
 */
export default function CourseListView({ title, subtitle, breadcrumbs, fixedCategory, searchMode = false }) {
  const uid = useId()
  const [sp, setSp] = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [view, setView] = useState('rows')
  const sheetRef = useRef(null)
  const filters = readFilters(sp)
  const ignoreCategories = Boolean(fixedCategory)
  const activeCount = countActive(filters, { ignoreCategories })
  useDialog(sheetRef, sheetOpen, () => setSheetOpen(false))

  const update = (next, replace = true) => setSp(writeFilters(next), { replace })
  const clearFilters = () => update({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })
  const clearAll = () => update({ ...EMPTY_FILTERS, sort: filters.sort })

  // searchCourses takes the text as `query`, not `q` (CONTRACT §3)
  const options = toSearchOptions(filters, { fixedCategory })
  const results = searchCourses(options)
  const counts = getFacetCounts(options)
  const nothingAsked = searchMode && !filters.q && activeCount === 0

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
    ...filters.skills.map((v) => ({ key: `s-${v}`, label: `skill: ${v}`, remove: { skills: filters.skills.filter((x) => x !== v) } })),
    ...(filters.minRating > 0 ? [{ key: 'r', label: `★ ${filters.minRating}+`, remove: { minRating: 0 } }] : []),
  ]

  const panelId = `${uid}-filters`

  return (
    <div className="list-page">
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />

      <div className="list-layout">
        <div className={`list-filters ${sheetOpen ? 'is-open' : ''}`}>
          {sheetOpen && <div className="sheet-overlay list-filters-overlay" onClick={() => setSheetOpen(false)} aria-hidden="true" />}
          <div
            ref={sheetRef}
            className="list-filters-inner"
            role={sheetOpen ? 'dialog' : undefined}
            aria-modal={sheetOpen ? 'true' : undefined}
            aria-label={sheetOpen ? 'Filters' : undefined}
          >
            <div className="list-filters-sheet-head">
              <span className="list-filters-sheet-title">Filters</span>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setSheetOpen(false)} aria-label="Close filters">
                <X />
              </button>
            </div>
            <FilterPanel
              id={panelId}
              filters={filters}
              onChange={(next) => update(next)}
              onClear={clearFilters}
              activeCount={activeCount}
              counts={counts}
              hideCategories={ignoreCategories}
            />
            <div className="list-filters-sheet-foot">
              {activeCount > 0 && (
                <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                  Clear {activeCount}
                </button>
              )}
              <button type="button" className="btn btn-primary list-filters-show" onClick={() => setSheetOpen(false)}>
                Show {results.length} {results.length === 1 ? 'course' : 'courses'}
              </button>
            </div>
          </div>
        </div>

        <section className="list-main" aria-label="Results">
          <div className="list-toolbar">
            <form className="list-search" role="search" onSubmit={onSearch}>
              <label htmlFor={`${uid}-q`} className="visually-hidden">
                {searchMode ? 'Search courses' : 'Search within these courses'}
              </label>
              <Search className="list-search-icon" aria-hidden="true" />
              <input
                key={filters.q}
                id={`${uid}-q`}
                name="q"
                type="search"
                className="input"
                defaultValue={filters.q}
                placeholder={searchMode ? 'Search courses, skills, providers…' : 'Filter by keyword…'}
                enterKeyHint="search"
              />
            </form>

            <button
              type="button"
              className="btn filters-toggle"
              aria-expanded={sheetOpen}
              aria-controls={panelId}
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal />
              Filters
              {activeCount > 0 && <span className="filters-toggle-count">{activeCount}</span>}
            </button>

            <label htmlFor={`${uid}-sort`} className="visually-hidden">
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
                  {s.label}
                </option>
              ))}
            </select>

            <div className="segmented segmented-icons view-toggle" role="group" aria-label="Layout">
              <button
                type="button"
                className={`segmented-item ${view === 'rows' ? 'is-active' : ''}`}
                aria-pressed={view === 'rows'}
                aria-label="Show as list"
                data-tip="List"
                onClick={() => setView('rows')}
              >
                <List />
              </button>
              <button
                type="button"
                className={`segmented-item ${view === 'cards' ? 'is-active' : ''}`}
                aria-pressed={view === 'cards'}
                aria-label="Show as cards"
                data-tip="Cards"
                onClick={() => setView('cards')}
              >
                <LayoutGrid />
              </button>
            </div>
          </div>

          <div className="list-status">
            <p className="list-count" aria-live="polite">
              {nothingAsked ? (
                'Type something to search'
              ) : (
                <>
                  <span className="list-count-n">{results.length}</span>{' '}
                  {results.length === 1 ? 'course' : 'courses'}
                  {filters.q && (
                    <>
                      {' '}
                      for <span className="list-count-q">“{filters.q}”</span>
                    </>
                  )}
                </>
              )}
            </p>
            {(activeTags.length > 0 || filters.q) && (
              <>
                <ul className="tag-list active-filters" aria-label="Active filters">
                  {filters.q && (
                    <li>
                      <SkillChip onRemove={() => update({ ...filters, q: '' })}>
                        “{filters.q}”
                      </SkillChip>
                    </li>
                  )}
                  {activeTags.map((t) => (
                    <li key={t.key}>
                      <SkillChip onRemove={() => update({ ...filters, ...t.remove })}>{t.label}</SkillChip>
                    </li>
                  ))}
                </ul>
                <button type="button" className="list-clear" onClick={clearAll}>
                  Clear all
                </button>
              </>
            )}
          </div>

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
            <CourseList
              courses={results}
              variant={view}
              label={title}
              empty={
                <EmptyState
                  icon={ListFilter}
                  title="No courses match"
                  actions={
                    <>
                      {(activeCount > 0 || filters.q) && (
                        <button type="button" className="btn btn-sm" onClick={clearAll}>
                          Clear filters
                        </button>
                      )}
                      <Link className="btn btn-sm btn-ghost" to="/recommend">
                        Get recommendations
                      </Link>
                    </>
                  }
                >
                  <p>Remove a filter or try a broader term.</p>
                </EmptyState>
              }
            />
          )}
        </section>
      </div>
    </div>
  )
}
