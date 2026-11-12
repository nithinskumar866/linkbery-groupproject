// Course list filters <-> URL query string, so filtered views are shareable.
// Multi-value filters use repeated params: ?level=Beginner&level=Advanced
import { SORTS } from './utils.js'

export const EMPTY_FILTERS = {
  q: '',
  categories: [],
  levels: [],
  platforms: [],
  price: [],
  skills: [],
  minRating: 0,
  sort: 'relevance',
}

const MULTI = [
  ['categories', 'category'],
  ['levels', 'level'],
  ['platforms', 'platform'],
  ['price', 'price'],
  ['skills', 'skill'],
]

const uniq = (arr) => [...new Set(arr.map((v) => v.trim()).filter(Boolean))]

export function readFilters(sp) {
  const f = { ...EMPTY_FILTERS }
  f.q = (sp.get('q') || '').trim()
  for (const [key, param] of MULTI) f[key] = uniq(sp.getAll(param))
  const r = Number(sp.get('rating'))
  f.minRating = Number.isFinite(r) && r > 0 && r <= 5 ? r : 0
  const sort = sp.get('sort')
  f.sort = SORTS.some((s) => s.value === sort) ? sort : 'relevance'
  return f
}

export function writeFilters(f) {
  const sp = new URLSearchParams()
  if (f.q) sp.set('q', f.q)
  for (const [key, param] of MULTI) (f[key] || []).forEach((v) => sp.append(param, v))
  if (f.minRating > 0) sp.set('rating', String(f.minRating))
  if (f.sort && f.sort !== 'relevance') sp.set('sort', f.sort)
  return sp
}

/**
 * URL filters -> the exact option object `searchCourses` / `getFacetCounts` take
 * (CONTRACT §3/§9). The URL uses `q`; the lib uses `query`. Only contract keys are
 * passed so the lib's unknown-key warning stays quiet.
 */
export function toSearchOptions(f, { fixedCategory } = {}) {
  return {
    query: f.q || '',
    categories: fixedCategory ? [fixedCategory] : f.categories,
    skills: f.skills,
    levels: f.levels,
    platforms: f.platforms,
    minRating: f.minRating,
    price: f.price,
    sort: f.sort,
  }
}

/** Number of active filters (not counting the text query or sort). */
export function countActive(f, { ignoreCategories = false } = {}) {
  let n = 0
  for (const [key] of MULTI) {
    if (ignoreCategories && key === 'categories') continue
    n += f[key].length
  }
  if (f.minRating > 0) n += 1
  return n
}
