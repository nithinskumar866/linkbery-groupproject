import { useId, useState } from 'react'
import { LEVELS, PRICES, getAllCourses, getAllSkills, getCategories, getPlatforms } from '../lib/courses.js'
import SkillChip from './SkillChip.jsx'
import { RATING_OPTIONS } from './utils.js'

const SHOW_FIRST = 6

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/**
 * One filter group: a fieldset with a visible legend and checkbox rows with counts.
 * `counts` ({ [value]: n }, from getFacetCounts) is optional; options with 0 results
 * are dimmed and disabled unless already selected (so they can still be unticked).
 * Long lists show the first few plus "Show N more"; selected options always stay visible.
 */
function CheckGroup({ legend, options, selected, onToggle, counts }) {
  const [expanded, setExpanded] = useState(false)
  const long = options.length > SHOW_FIRST + 1
  const visible = !long || expanded ? options : options.filter((o, i) => i < SHOW_FIRST || selected.includes(o.value))
  const hidden = options.length - visible.length

  return (
    <fieldset className="filter-group">
      <legend className="filter-legend">{legend}</legend>
      <ul className="check-list">
        {visible.map((o) => {
          const checked = selected.includes(o.value)
          const n = counts ? (counts[o.value] ?? 0) : null
          const empty = n === 0 && !checked
          return (
            <li key={o.value}>
              <label className={`check-row ${empty ? 'is-empty' : ''} ${checked ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={checked}
                  disabled={empty}
                  onChange={() => onToggle(o.value)}
                />
                <span className="check-label">{o.label}</span>
                {n !== null && (
                  <span className="check-count">
                    {n}
                    <span className="visually-hidden"> {n === 1 ? 'course' : 'courses'}</span>
                  </span>
                )}
              </label>
            </li>
          )
        })}
      </ul>
      {long && (hidden > 0 || expanded) && (
        <button type="button" className="check-more" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
          {expanded ? 'Show less' : `Show ${hidden} more`}
        </button>
      )}
    </fieldset>
  )
}

function platformNames() {
  const names = new Set(getPlatforms().map((p) => p.name))
  getAllCourses().forEach((c) => c.platform && names.add(c.platform))
  return [...names]
}

/**
 * Controlled filter column. `filters` is the object from filterParams.readFilters,
 * `onChange(next)` receives the whole updated object, `onClear` clears every filter.
 * `hideHead` hides the "Filters / Clear all" row (the mobile sheet has its own).
 */
export default function FilterPanel({ filters, onChange, onClear, activeCount = 0, hideCategories = false, counts, id, hideHead = false }) {
  const uid = useId()
  const set = (patch) => onChange({ ...filters, ...patch })
  const categories = getCategories()
  // Technical first, then non-technical (getCategories order within each).
  const catOptions = [
    ...categories.filter((c) => c.group === 'technical'),
    ...categories.filter((c) => c.group !== 'technical'),
  ].map((c) => ({ value: c.slug, label: c.name }))
  const skills = getAllSkills().filter((s) => !filters.skills.includes(s.name))

  return (
    <div className="filter-panel" id={id}>
      {!hideHead && (
        <div className="filter-panel-head">
          <h2 className="filter-panel-title">Filters</h2>
          {activeCount > 0 && (
            <button type="button" className="filter-clear" onClick={onClear}>
              Clear all
            </button>
          )}
        </div>
      )}

      {!hideCategories && (
        <CheckGroup
          legend="Category"
          options={catOptions}
          selected={filters.categories}
          counts={counts?.categories}
          onToggle={(v) => set({ categories: toggle(filters.categories, v) })}
        />
      )}

      <CheckGroup
        legend="Level"
        options={LEVELS.map((l) => ({ value: l, label: l }))}
        selected={filters.levels}
        counts={counts?.levels}
        onToggle={(v) => set({ levels: toggle(filters.levels, v) })}
      />

      <CheckGroup
        legend="Platform"
        options={platformNames().map((p) => ({ value: p, label: p }))}
        selected={filters.platforms}
        counts={counts?.platforms}
        onToggle={(v) => set({ platforms: toggle(filters.platforms, v) })}
      />

      <CheckGroup
        legend="Price"
        options={PRICES.map((p) => ({ value: p, label: p }))}
        selected={filters.price}
        counts={counts?.price}
        onToggle={(v) => set({ price: toggle(filters.price, v) })}
      />

      <fieldset className="filter-group">
        <legend className="filter-legend">Rating</legend>
        <ul className="check-list">
          {RATING_OPTIONS.map((r) => (
            <li key={r}>
              <label className={`check-row ${filters.minRating === r ? 'is-checked' : ''}`}>
                <input
                  type="radio"
                  className="checkbox"
                  name={`${uid}-rating`}
                  checked={filters.minRating === r}
                  onChange={() => set({ minRating: r })}
                />
                <span className="check-label">
                  {r === 0 ? (
                    'Any rating'
                  ) : (
                    <>
                      <span className="rating-star" aria-hidden="true">
                        ★
                      </span>{' '}
                      {r.toFixed(1)} and up
                    </>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="filter-group">
        <label htmlFor={`${uid}-skill`} className="filter-legend">
          Skills
        </label>
        <p className="field-hint filter-skill-hint">Courses must teach every selected skill.</p>
        <select
          id={`${uid}-skill`}
          className="select select-sm"
          value=""
          onChange={(e) => e.target.value && set({ skills: [...filters.skills, e.target.value] })}
        >
          <option value="">Add a skill…</option>
          {skills.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
        {filters.skills.length > 0 && (
          <ul className="tag-list filter-skill-tags">
            {filters.skills.map((s) => (
              <li key={s}>
                <SkillChip active onRemove={() => set({ skills: filters.skills.filter((x) => x !== s) })}>
                  {s}
                </SkillChip>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
