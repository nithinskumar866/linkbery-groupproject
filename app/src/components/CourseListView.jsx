import { useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchCourses } from '../lib/courses.js'
import CourseGrid from './CourseGrid.jsx'
import EmptyState from './EmptyState.jsx'
import FilterPanel from './FilterPanel.jsx'
import PageHeader from './PageHeader.jsx'
import SkillChip from './SkillChip.jsx'
import { EMPTY_FILTERS, countActive, readFilters, writeFilters } from './filterParams.js'
import { SORTS, categoryName } from './utils.js'

/**
 * Shared course list: filter sidebar + toolbar + grid, all state in the URL.
 * Used by /courses, /category/:slug and /search.
 */
export default function CourseListView({ title, subtitle, icon, breadcrumbs, fixedCategory, searchMode = false }) {
  const uid = useId()
  const [sp, setSp] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filters = readFilters(sp)
  const ignoreCategories = Boolean(fixedCategory)
  const activeCount = countActive(filters, { ignoreCategories })

  const update = (next, replace = true) => setSp(writeFilters(next), { replace })
  const clearFilters = () => update({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })

  const query = {
    ...filters,
    query: filters.q, // searchCourses takes the text as `query` (CONTRACT §3)
    categories: fixedCategory ? [fixedCategory] : filters.categories,
  }
  const results = searchCourses(query)
  const nothingAsked = searchMode && !filters.q && activeCount === 0

  const onSearch = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim() || ''
    update({ ...filters, q }, false)
  }

  const activeChips = [
    ...(ignoreCategories ? [] : filters.categories.map((v) => ({ key: `c-${v}`, label: categoryName(v), remove: { categories: filters.categories.filter((x) => x !== v) } }))),
    ...filters.levels.map((v) => ({ key: `l-${v}`, label: v, remove: { levels: filters.levels.filter((x) => x !== v) } })),
    ...filters.platforms.map((v) => ({ key: `p-${v}`, label: v, remove: { platforms: filters.platforms.filter((x) => x !== v) } })),
    ...filters.price.map((v) => ({ key: `$-${v}`, label: v, remove: { price: filters.price.filter((x) => x !== v) } })),
    ...filters.skills.map((v) => ({ key: `s-${v}`, label: `Skill: ${v}`, remove: { skills: filters.skills.filter((x) => x !== v) } })),
    ...(filters.minRating > 0 ? [{ key: 'r', label: `${filters.minRating}+ stars`, remove: { minRating: 0 } }] : []),
  ]

  const panelId = `${uid}-filters`

  return (
    <div className="list-page">
      <PageHeader title={title} subtitle={subtitle} icon={icon} breadcrumbs={breadcrumbs} />

      <div className="list-layout">
        <div className={`list-filters ${filtersOpen ? 'is-open' : ''}`}>
          <FilterPanel
            id={panelId}
            filters={filters}
            onChange={(next) => update(next)}
            onClear={clearFilters}
            activeCount={activeCount}
            hideCategories={ignoreCategories}
          />
        </div>

        <section className="list-main" aria-label="Results">
          <div className="list-toolbar">
            <form className="list-search" role="search" onSubmit={onSearch}>
              <label htmlFor={`${uid}-q`} className="visually-hidden">
                {searchMode ? 'Search courses' : 'Search within these courses'}
              </label>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                key={filters.q}
                id={`${uid}-q`}
                name="q"
                type="search"
                className="input"
                defaultValue={filters.q}
                placeholder={searchMode ? 'Search courses, skills, providers…' : 'Search within these courses…'}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            <div className="list-toolbar-row">
              <button
                type="button"
                className="btn btn-outline btn-sm filters-toggle"
                aria-expanded={filtersOpen}
                aria-controls={panelId}
                onClick={() => setFiltersOpen((o) => !o)}
              >
                <i className="fa-solid fa-sliders" aria-hidden="true" /> Filters{activeCount > 0 ? ` (${activeCount})` : ''}
              </button>

              <p className="result-count" aria-live="polite">
                {nothingAsked ? (
                  'Type something to search'
                ) : (
                  <>
                    <strong>{results.length}</strong> {results.length === 1 ? 'course' : 'courses'}
                    {filters.q && (
                      <>
                        {' '}
                        for “<span className="result-query">{filters.q}</span>”
                      </>
                    )}
                  </>
                )}
              </p>

              <div className="sort-control">
                <label htmlFor={`${uid}-sort`}>Sort by</label>
                <select
                  id={`${uid}-sort`}
                  className="select"
                  value={filters.sort}
                  onChange={(e) => update({ ...filters, sort: e.target.value })}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(activeChips.length > 0 || filters.q) && (
              <div className="active-filters">
                <ul className="chip-list" aria-label="Active filters">
                  {filters.q && (
                    <li>
                      <SkillChip active onRemove={() => update({ ...filters, q: '' })}>
                        “{filters.q}”
                      </SkillChip>
                    </li>
                  )}
                  {activeChips.map((c) => (
                    <li key={c.key}>
                      <SkillChip active onRemove={() => update({ ...filters, ...c.remove })}>
                        {c.label}
                      </SkillChip>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" /> Clear all
                </button>
              </div>
            )}
          </div>

          {nothingAsked ? (
            <EmptyState icon="fa-magnifying-glass" title="What would you like to learn?">
              <p>Search by course title, skill, provider or platform. For example:</p>
              <ul className="chip-list chip-list-center">
                {['Python', 'Machine Learning', 'UI/UX', 'SQL', 'Cybersecurity', 'Project Management'].map((s) => (
                  <li key={s}>
                    <SkillChip to={`/search?q=${encodeURIComponent(s)}`}>{s}</SkillChip>
                  </li>
                ))}
              </ul>
            </EmptyState>
          ) : (
            <CourseGrid
              courses={results}
              label={title}
              empty={
                <EmptyState
                  icon="fa-filter-circle-xmark"
                  title="No courses match"
                  actions={
                    <>
                      {(activeCount > 0 || filters.q) && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}
                        >
                          Clear filters
                        </button>
                      )}
                      <Link className="btn btn-outline" to="/recommend">
                        Get recommendations
                      </Link>
                    </>
                  }
                >
                  <p>Try removing a filter or searching for a broader term.</p>
                </EmptyState>
              }
            />
          )}
        </section>
      </div>
    </div>
  )
}
