import { useId, useState } from 'react'
import { LEVELS, PRICES, getAllCourses, getAllSkills, getCategories, getPlatforms } from '../lib/courses.js'
import { CategoryIcon, ChevronDown } from './icons.js'
import SkillChip from './SkillChip.jsx'
import { RATING_OPTIONS } from './utils.js'

const SHOW_FIRST = 6

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/** Collapsible filter group with a header button. */
function Group({ title, selectedCount = 0, children, defaultOpen = true }) {
  const uid = useId()
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`filter-group ${open ? 'is-open' : ''}`}>
      <h3 className="filter-group-head">
        <button
          type="button"
          className="filter-group-toggle"
          aria-expanded={open}
          aria-controls={`${uid}-body`}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="filter-group-title">{title}</span>
          {selectedCount > 0 && <span className="filter-group-count">{selectedCount}</span>}
          <ChevronDown className="filter-group-chevron" aria-hidden="true" />
        </button>
      </h3>
      <div id={`${uid}-body`} className="filter-group-body" hidden={!open}>
        {children}
      </div>
    </div>
  )
}

/**
 * Checkbox rows. `counts` ({ [value]: n }, from getFacetCounts) is optional; when given,
 * each option shows its count, and options with 0 results are dimmed and disabled
 * unless they are already selected (so they can still be unticked).
 */
function CheckList({ legend, options, selected, onToggle, counts }) {
  const [expanded, setExpanded] = useState(false)
  // Selected options always stay visible.
  const visible =
    expanded || options.length <= SHOW_FIRST + 2
      ? options
      : options.filter((o, i) => i < SHOW_FIRST || selected.includes(o.value))
  const hidden = options.length - visible.length

  return (
    <fieldset>
      <legend className="visually-hidden">{legend}</legend>
      <ul className="check-list">
        {visible.map((o) => {
          const checked = selected.includes(o.value)
          const n = counts ? (counts[o.value] ?? 0) : null
          const empty = n === 0
          return (
            <li key={o.value}>
              <label className={`check-row ${empty && !checked ? 'is-empty' : ''} ${checked ? 'is-checked' : ''}`}>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={checked}
                  disabled={empty && !checked}
                  onChange={() => onToggle(o.value)}
                />
                {o.icon && <span className="check-icon">{o.icon}</span>}
                <span className="check-label">{o.label}</span>
                {n !== null && (
                  <span className="check-count" aria-label={`${n} ${n === 1 ? 'course' : 'courses'}`}>
                    {n}
                  </span>
                )}
              </label>
            </li>
          )
        })}
      </ul>
      {(hidden > 0 || expanded) && options.length > SHOW_FIRST + 2 && (
        <button type="button" className="check-more" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
          {expanded ? 'Show fewer' : `Show ${hidden} more`}
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

const countIn = (list, values) => list.filter((v) => values.includes(v)).length

/**
 * Controlled filter column. `filters` is the object from filterParams.readFilters,
 * `onChange(next)` receives the whole updated object.
 */
export default function FilterPanel({ filters, onChange, onClear, activeCount = 0, hideCategories = false, counts, id }) {
  const uid = useId()
  const set = (patch) => onChange({ ...filters, ...patch })
  const categories = getCategories()
  const skills = getAllSkills().filter((s) => !filters.skills.includes(s.name))
  const catOptions = (group) =>
    categories
      .filter((c) => (group === 'technical' ? c.group === 'technical' : c.group !== 'technical'))
      .map((c) => ({ value: c.slug, label: c.name, icon: <CategoryIcon slug={c.slug} /> }))
  const tech = catOptions('technical')
  const nonTech = catOptions('non-technical')

  return (
    <aside className="filter-panel" id={id} aria-label="Filters">
      <div className="filter-panel-head">
        <h2 className="section-label">Filters</h2>
        {activeCount > 0 && (
          <button type="button" className="filter-clear" onClick={onClear}>
            Clear {activeCount}
          </button>
        )}
      </div>

      {!hideCategories && (
        <>
          <Group
            title="Technical"
            selectedCount={countIn(filters.categories, tech.map((o) => o.value))}
          >
            <CheckList
              legend="Technical categories"
              options={tech}
              selected={filters.categories}
              counts={counts?.categories}
              onToggle={(v) => set({ categories: toggle(filters.categories, v) })}
            />
          </Group>
          <Group
            title="Non-technical"
            selectedCount={countIn(filters.categories, nonTech.map((o) => o.value))}
          >
            <CheckList
              legend="Non-technical categories"
              options={nonTech}
              selected={filters.categories}
              counts={counts?.categories}
              onToggle={(v) => set({ categories: toggle(filters.categories, v) })}
            />
          </Group>
        </>
      )}

      <Group title="Level" selectedCount={filters.levels.length}>
        <CheckList
          legend="Level"
          options={LEVELS.map((l) => ({ value: l, label: l }))}
          selected={filters.levels}
          counts={counts?.levels}
          onToggle={(v) => set({ levels: toggle(filters.levels, v) })}
        />
      </Group>

      <Group title="Platform" selectedCount={filters.platforms.length}>
        <CheckList
          legend="Platform"
          options={platformNames().map((p) => ({ value: p, label: p }))}
          selected={filters.platforms}
          counts={counts?.platforms}
          onToggle={(v) => set({ platforms: toggle(filters.platforms, v) })}
        />
      </Group>

      <Group title="Price" selectedCount={filters.price.length}>
        <CheckList
          legend="Price"
          options={PRICES.map((p) => ({ value: p, label: p }))}
          selected={filters.price}
          counts={counts?.price}
          onToggle={(v) => set({ price: toggle(filters.price, v) })}
        />
      </Group>

      <Group title="Rating" selectedCount={filters.minRating > 0 ? 1 : 0}>
        <fieldset>
          <legend className="visually-hidden">Minimum rating</legend>
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
                      <span className="check-rating">
                        <span className="rating-star" aria-hidden="true">
                          ★
                        </span>{' '}
                        {r.toFixed(1)}+
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </Group>

      <Group title="Skills" selectedCount={filters.skills.length} defaultOpen={filters.skills.length > 0}>
        <label htmlFor={`${uid}-skill`} className="field-hint filter-skill-hint">
          Courses must teach every selected skill
        </label>
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
      </Group>
    </aside>
  )
}
