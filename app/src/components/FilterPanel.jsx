import { useId } from 'react'
import { getAllCourses, getAllSkills, getCategories, getPlatforms } from '../lib/courses.js'
import SkillChip from './SkillChip.jsx'
import { LEVELS, PRICES, RATING_OPTIONS } from './utils.js'

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function CheckGroup({ legend, options, selected, onToggle }) {
  return (
    <fieldset className="filter-group">
      <legend>{legend}</legend>
      <ul className="check-list">
        {options.map((o) => (
          <li key={o.value}>
            <label className="check">
              <input type="checkbox" checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} />
              <span>
                {o.icon && <i className={`fa-solid ${o.icon} check-icon`} aria-hidden="true" />}
                {o.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

function platformNames() {
  const names = new Set(getPlatforms().map((p) => p.name))
  getAllCourses().forEach((c) => c.platform && names.add(c.platform))
  return [...names]
}

/**
 * Controlled filter sidebar. `filters` is the object from filterParams.readFilters,
 * `onChange(next)` receives the whole updated object.
 */
export default function FilterPanel({ filters, onChange, onClear, activeCount = 0, hideCategories = false, id }) {
  const uid = useId()
  const set = (patch) => onChange({ ...filters, ...patch })
  const categories = getCategories()
  const skills = getAllSkills().filter((s) => !filters.skills.includes(s.name))

  return (
    <aside className="filter-panel" id={id} aria-label="Filters">
      <div className="filter-panel-head">
        <h2>
          <i className="fa-solid fa-sliders" aria-hidden="true" /> Filters
        </h2>
        {activeCount > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            Clear ({activeCount})
          </button>
        )}
      </div>

      {!hideCategories && (
        <>
          <CheckGroup
            legend="Technical"
            options={categories.filter((c) => c.group === 'technical').map((c) => ({ value: c.slug, label: c.name, icon: c.icon }))}
            selected={filters.categories}
            onToggle={(v) => set({ categories: toggle(filters.categories, v) })}
          />
          <CheckGroup
            legend="Non-technical"
            options={categories.filter((c) => c.group !== 'technical').map((c) => ({ value: c.slug, label: c.name, icon: c.icon }))}
            selected={filters.categories}
            onToggle={(v) => set({ categories: toggle(filters.categories, v) })}
          />
        </>
      )}

      <CheckGroup
        legend="Level"
        options={LEVELS.map((l) => ({ value: l, label: l }))}
        selected={filters.levels}
        onToggle={(v) => set({ levels: toggle(filters.levels, v) })}
      />

      <CheckGroup
        legend="Platform"
        options={platformNames().map((p) => ({ value: p, label: p }))}
        selected={filters.platforms}
        onToggle={(v) => set({ platforms: toggle(filters.platforms, v) })}
      />

      <fieldset className="filter-group">
        <legend>Minimum rating</legend>
        <ul className="check-list">
          {RATING_OPTIONS.map((r) => (
            <li key={r}>
              <label className="check">
                <input
                  type="radio"
                  name={`${uid}-rating`}
                  checked={filters.minRating === r}
                  onChange={() => set({ minRating: r })}
                />
                <span>
                  {r === 0 ? (
                    'Any rating'
                  ) : (
                    <>
                      <i className="fa-solid fa-star check-star" aria-hidden="true" /> {r.toFixed(1)} &amp; up
                    </>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <CheckGroup
        legend="Price"
        options={PRICES.map((p) => ({ value: p, label: p }))}
        selected={filters.price}
        onToggle={(v) => set({ price: toggle(filters.price, v) })}
      />

      <fieldset className="filter-group">
        <legend>Skills</legend>
        <label htmlFor={`${uid}-skill`} className="field-hint">
          Courses must teach all selected skills
        </label>
        <select
          id={`${uid}-skill`}
          className="select"
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
          <ul className="chip-list filter-skill-chips">
            {filters.skills.map((s) => (
              <li key={s}>
                <SkillChip active onRemove={() => set({ skills: filters.skills.filter((x) => x !== s) })}>
                  {s}
                </SkillChip>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    </aside>
  )
}
