// Course data access. All functions are synchronous and pure (CONTRACT.md section 3).
// Derived data (indexes, skill counts, platform list, insights) is computed once at module load.
import rawCourses from '../data/courses.json'

const CATEGORIES = [
  ['development', 'Development', 'technical', 'fa-code'],
  ['coding', 'Coding', 'technical', 'fa-terminal'],
  ['ui-ux', 'UI/UX', 'technical', 'fa-pen-ruler'],
  ['data-science', 'Data Science', 'technical', 'fa-chart-line'],
  ['ai-ml', 'AI & ML', 'technical', 'fa-robot'],
  ['cybersecurity', 'Cybersecurity', 'technical', 'fa-shield-halved'],
  ['cloud', 'Cloud', 'technical', 'fa-cloud'],
  ['math', 'Math', 'technical', 'fa-square-root-variable'],
  ['software', 'Software', 'technical', 'fa-gear'],
  ['science', 'Science', 'technical', 'fa-flask'],
  ['business', 'Business', 'non-technical', 'fa-briefcase'],
  ['project-management', 'Project Management', 'non-technical', 'fa-list-check'],
  ['marketing', 'Marketing', 'non-technical', 'fa-bullhorn'],
  ['design', 'Design', 'non-technical', 'fa-palette'],
  ['photography', 'Photography', 'non-technical', 'fa-camera'],
  ['music', 'Music', 'non-technical', 'fa-music'],
  ['film', 'Film', 'non-technical', 'fa-film'],
  ['fitness', 'Fitness', 'non-technical', 'fa-dumbbell'],
].map(([slug, name, group, icon]) => ({ slug, name, group, icon }))

const KNOWN_PLATFORMS = {
  Coursera: { logo: '/images/c.jpg', url: 'https://www.coursera.org' },
  Udemy: { logo: '/images/udemy.jpg', url: 'https://www.udemy.com' },
  edX: { logo: '/images/edx.jpg', url: 'https://www.edx.org' },
  Guvi: { logo: '/images/guvi.jpg', url: 'https://www.guvi.in' },
  Simplilearn: { logo: '/images/sl.jpg', url: 'https://www.simplilearn.com' },
  Unacademy: { logo: '/images/unacademy.jpg', url: 'https://unacademy.com' },
  YouTube: { logo: '/images/platforms/youtube.svg', url: 'https://www.youtube.com' },
  'Khan Academy': { logo: '/images/platforms/khan-academy.svg', url: 'https://www.khanacademy.org' },
  'fast.ai': { logo: '/images/platforms/fastai.svg', url: 'https://www.fast.ai' },
}

export const LEVELS = Object.freeze(['Beginner', 'Intermediate', 'Advanced', 'Mixed'])
export const PRICES = Object.freeze(['Free', 'Free to audit', 'Paid'])
const LEVEL_ORDER = LEVELS

// ---------------------------------------------------------------------------
// Development-only check for misspelled option keys (CONTRACT.md integration
// rule): e.g. searchCourses({ q }) instead of { query } must not fail silently.
// ---------------------------------------------------------------------------
const IS_DEV = (() => {
  try {
    return Boolean(import.meta.env?.DEV)
  } catch {
    return false
  }
})()

function warnUnknownKeys(fnName, options, allowed) {
  if (!IS_DEV || !options || typeof options !== 'object') return
  const unknown = Object.keys(options).filter((k) => !allowed.includes(k))
  if (unknown.length) {
    console.warn(`[linkbery] ${fnName}: unknown option(s) ${unknown.map((k) => `"${k}"`).join(', ')} ignored. Allowed: ${allowed.join(', ')}.`)
  }
}

const FILTER_KEYS = ['query', 'categories', 'skills', 'levels', 'platforms', 'minRating', 'price', 'sort']
const RECOMMEND_KEYS = ['level', 'limit']

// ---------------------------------------------------------------------------
// Memoized derived data
// ---------------------------------------------------------------------------
const courses = rawCourses
const byId = new Map(courses.map((c) => [c.id, c]))
const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]))

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const PLATFORMS = (() => {
  const counts = new Map()
  for (const c of courses) counts.set(c.platform, (counts.get(c.platform) || 0) + 1)
  return [...counts.keys()]
    .sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b))
    .map((name) => {
      const known = KNOWN_PLATFORMS[name]
      let url = known?.url ?? null
      if (!url) {
        const sample = courses.find((c) => c.platform === name)
        try { url = new URL(sample.url).origin } catch { url = null }
      }
      return { name, slug: slugify(name), logo: known?.logo ?? null, url }
    })
})()

function countSkills(list) {
  const m = new Map()
  for (const c of list) for (const s of c.skills) m.set(s, (m.get(s) || 0) + 1)
  return [...m]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

const ALL_SKILLS = countSkills(courses)

// Pre-lowercased search fields per course.
const searchIndex = new Map(
  courses.map((c) => [
    c.id,
    {
      title: c.title.toLowerCase(),
      skills: c.skills.map((s) => s.toLowerCase()),
      other: [c.provider, c.platform, c.description ?? ''].join(' ').toLowerCase(),
    },
  ]),
)

const tokenize = (q) =>
  String(q ?? '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#.]+/u)
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter(Boolean)

const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null)
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
const round2 = (n) => (n == null ? null : Math.round(n * 100) / 100)

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const getAllCourses = () => courses
export const getCourseById = (id) => byId.get(id)
export const getCategories = () => CATEGORIES
export const getCategory = (slug) => categoryBySlug.get(slug)
export const getPlatforms = () => PLATFORMS
export const getAllSkills = () => ALL_SKILLS

const byRating = (a, b) =>
  (b.rating ?? -1) - (a.rating ?? -1) || (b.reviewCount ?? -1) - (a.reviewCount ?? -1) || a.title.localeCompare(b.title)
const byReviews = (a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1) || byRating(a, b)
const byTitle = (a, b) => a.title.localeCompare(b.title)

/** Relevance of a course for query tokens: title (3) > skill (2) > other field (1), summed per token. */
function relevance(course, tokens) {
  const ix = searchIndex.get(course.id)
  let score = 0
  for (const t of tokens) {
    if (ix.title.includes(t)) score += 3
    else if (ix.skills.some((s) => s.includes(t))) score += 2
    else score += 1
  }
  return score
}

function matchesAllTokens(course, tokens) {
  const ix = searchIndex.get(course.id)
  return tokens.every((t) => ix.title.includes(t) || ix.other.includes(t) || ix.skills.some((s) => s.includes(t)))
}

// Accept a single string as a one-item list (e.g. a value read from the URL).
const asList = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v])

/**
 * Normalize a filter object into per-facet predicates. "base" covers the
 * filters that are not facets (query, skills, minRating); the four facets are
 * separate so getFacetCounts can drop one facet at a time.
 */
function buildFilter(filters) {
  const f = filters && typeof filters === 'object' ? filters : {}
  const tokens = tokenize(f.query ?? '')
  const skillSet = asList(f.skills).map((s) => String(s).toLowerCase())
  const min = Number(f.minRating) || 0
  const categories = asList(f.categories)
  const levels = asList(f.levels)
  const platforms = asList(f.platforms)
  const price = asList(f.price)
  return {
    tokens,
    sort: f.sort ?? 'relevance',
    base: (c) =>
      (!tokens.length || matchesAllTokens(c, tokens)) &&
      (!skillSet.length || skillSet.every((s) => searchIndex.get(c.id).skills.includes(s))) &&
      (min <= 0 || (c.rating != null && c.rating >= min)),
    facets: {
      categories: (c) => !categories.length || c.categories.some((x) => categories.includes(x)),
      levels: (c) => !levels.length || levels.includes(c.level),
      platforms: (c) => !platforms.length || platforms.includes(c.platform),
      price: (c) => !price.length || price.includes(c.price),
    },
  }
}

const FACETS = ['categories', 'levels', 'platforms', 'price']

export function searchCourses(filters = {}) {
  warnUnknownKeys('searchCourses', filters, FILTER_KEYS)
  const { tokens, sort, base, facets } = buildFilter(filters)
  const result = courses.filter((c) => base(c) && FACETS.every((k) => facets[k](c)))

  switch (sort) {
    case 'rating':
      return result.sort(byRating)
    case 'reviews':
      return result.sort(byReviews)
    case 'title':
      return result.sort(byTitle)
    default:
      if (!tokens.length) return result // keep data order when there is nothing to rank by
      return result
        .map((c) => [c, relevance(c, tokens)])
        .sort((a, b) => b[1] - a[1] || byRating(a[0], b[0]))
        .map(([c]) => c)
  }
}

export function getRelatedCourses(id, limit = 4) {
  const base = byId.get(id)
  if (!base) return []
  const skills = new Set(base.skills)
  const cats = new Set(base.categories)
  return courses
    .filter((c) => c.id !== id)
    .map((c) => {
      const sharedSkills = c.skills.filter((s) => skills.has(s)).length
      const sharedCats = c.categories.filter((k) => cats.has(k)).length
      return [c, sharedSkills * 2 + sharedCats * 3]
    })
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1] || byRating(a[0], b[0]))
    .slice(0, limit)
    .map(([c]) => c)
}

// Option value(s) of a course for each facet, and every known option per facet.
const FACET_VALUES = {
  categories: (c) => c.categories,
  levels: (c) => [c.level],
  platforms: (c) => [c.platform],
  price: (c) => [c.price],
}
const FACET_OPTIONS = {
  categories: CATEGORIES.map((c) => c.slug),
  levels: LEVELS,
  platforms: PLATFORMS.map((p) => p.name),
  price: PRICES,
}

/**
 * Standard faceted counts (CONTRACT.md section 9): the count for option o of
 * facet F is the number of courses matching every current filter except F's
 * own selection, with o applied. So selecting "Beginner" does not zero out
 * "Intermediate"; it shows how many results picking it as well would add.
 */
export function getFacetCounts(filters = {}) {
  warnUnknownKeys('getFacetCounts', filters, FILTER_KEYS)
  const { base, facets } = buildFilter(filters)
  const pool = courses.filter(base)
  const out = {}
  for (const facet of FACETS) {
    const counts = Object.fromEntries(FACET_OPTIONS[facet].map((o) => [o, 0]))
    const others = FACETS.filter((k) => k !== facet)
    for (const c of pool) {
      if (!others.every((k) => facets[k](c))) continue
      for (const v of new Set(FACET_VALUES[facet](c))) if (v in counts) counts[v]++
    }
    out[facet] = counts
  }
  return out
}

/** Id of the course with the strictly highest value, or null (no data / tie). */
function bestBy(list, key) {
  let best = null
  let tie = false
  for (const c of list) {
    const v = c[key]
    if (v == null) continue
    if (!best || v > best[key]) {
      best = c
      tie = false
    } else if (v === best[key]) tie = true
  }
  return best && !tie ? best.id : null
}

export function getCompareSummary(ids = []) {
  const list = [...new Set(asList(ids))].map((id) => byId.get(id)).filter(Boolean)
  const skillSets = list.map((c) => new Set(c.skills.map((s) => s.toLowerCase())))

  const sharedSkills =
    list.length >= 2 ? list[0].skills.filter((s) => skillSets.every((set) => set.has(s.toLowerCase()))) : []

  const uniqueSkills = {}
  list.forEach((c, i) => {
    uniqueSkills[c.id] = c.skills.filter((s) => skillSets.every((set, j) => j === i || !set.has(s.toLowerCase())))
  })

  return {
    courses: list,
    sharedSkills,
    uniqueSkills,
    best: { rating: bestBy(list, 'rating'), reviews: bestBy(list, 'reviewCount') },
  }
}

const INSIGHTS = PLATFORMS.map((platform) => {
    const list = courses.filter((c) => c.platform === platform.name)
    const levels = Object.fromEntries(LEVEL_ORDER.map((l) => [l, 0]))
    const categories = {}
    for (const c of list) {
      levels[c.level] = (levels[c.level] || 0) + 1
      for (const k of c.categories) categories[k] = (categories[k] || 0) + 1
    }
    return {
      platform,
      courseCount: list.length,
      avgRating: round2(avg(list.filter((c) => c.rating != null).map((c) => c.rating))),
      totalReviews: list.reduce((sum, c) => sum + (c.reviewCount ?? 0), 0),
      levels,
      topSkills: countSkills(list).slice(0, 5),
      categories,
    }
  }).sort((a, b) => b.courseCount - a.courseCount)

export const getPlatformInsights = () => INSIGHTS

const OVERALL = {
  courseCount: courses.length,
  platformCount: PLATFORMS.length,
  skillCount: ALL_SKILLS.length,
  avgRating: round1(avg(courses.filter((c) => c.rating != null).map((c) => c.rating))),
}
export const getOverallStats = () => OVERALL

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------
// Multi-word phrases are expanded first, then single tokens. Each value is a
// list of skill/topic phrases that the goal is taken to mean.
const SYNONYMS = {
  'web dev': ['Web Development', 'JavaScript', 'HTML', 'CSS'],
  'web development': ['Web Development', 'JavaScript', 'HTML', 'CSS'],
  'web developer': ['Web Development', 'JavaScript', 'HTML', 'CSS'],
  'full stack': ['Full-Stack Web Development', 'Web Development', 'JavaScript'],
  'front end': ['Front-End Web Development', 'JavaScript', 'React'],
  'back end': ['Back-End Web Development', 'Databases', 'SQL'],
  'data analyst': ['Data Analysis', 'SQL', 'Microsoft Excel', 'Data Visualization'],
  'data analysis': ['Data Analysis', 'SQL', 'Data Visualization'],
  'data scientist': ['Data Science', 'Machine Learning', 'Python Programming', 'Statistics'],
  'data science': ['Data Science', 'Machine Learning', 'Python Programming', 'Statistics'],
  'machine learning': ['Machine Learning'],
  'deep learning': ['Deep Learning', 'Machine Learning'],
  'project manager': ['Project Management', 'Agile'],
  'project management': ['Project Management', 'Agile'],
  'digital marketing': ['Digital Marketing', 'Marketing', 'Social Media'],
  'graphic design': ['Graphic Design', 'Visual Design', 'Typography'],
  'ethical hacking': ['Ethical Hacking', 'Network Security'],
  'cloud computing': ['Cloud Computing', 'Amazon Web Services'],
  ml: ['Machine Learning'],
  ai: ['Artificial Intelligence', 'Machine Learning'],
  dl: ['Deep Learning'],
  nlp: ['Natural Language Processing'],
  llm: ['Natural Language Processing', 'Deep Learning', 'Generative AI'],
  genai: ['Generative AI'],
  js: ['JavaScript'],
  javascript: ['JavaScript'],
  ts: ['TypeScript', 'JavaScript'],
  typescript: ['TypeScript', 'JavaScript'],
  py: ['Python Programming'],
  python: ['Python Programming'],
  ui: ['User Experience Design', 'Visual Design', 'Figma'],
  ux: ['User Experience', 'User Experience Design', 'User Research'],
  dsa: ['Data Structures', 'Algorithms'],
  algorithms: ['Algorithms'],
  sql: ['SQL', 'Databases'],
  database: ['Databases', 'SQL'],
  databases: ['Databases', 'SQL'],
  pm: ['Project Management'],
  pmp: ['Project Management', 'PMP'],
  ds: ['Data Science'],
  devops: ['DevOps', 'Docker', 'Kubernetes', 'Cloud Computing'],
  aws: ['Amazon Web Services', 'Cloud Computing'],
  cloud: ['Cloud Computing'],
  security: ['Network Security', 'Cybersecurity'],
  cybersecurity: ['Cybersecurity', 'Network Security'],
  hacking: ['Ethical Hacking', 'Penetration Testing'],
  seo: ['Search Engine Optimization'],
  marketing: ['Marketing', 'Digital Marketing'],
  excel: ['Microsoft Excel'],
  stats: ['Statistics', 'General Statistics', 'Probability & Statistics'],
  statistics: ['Statistics', 'General Statistics', 'Probability & Statistics'],
  math: ['Mathematics', 'Linear Algebra', 'Calculus'],
  maths: ['Mathematics', 'Linear Algebra', 'Calculus'],
  react: ['React'],
  web: ['Web Development'],
  design: ['Graphic Design', 'Visual Design'],
  photo: ['Photography'],
  photography: ['Photography'],
  music: ['Music Theory', 'Piano'],
  piano: ['Piano'],
  film: ['Filmmaking'],
  filmmaking: ['Filmmaking'],
  video: ['Video Editing', 'Filmmaking'],
  fitness: ['Physical Fitness', 'Yoga'],
  yoga: ['Yoga'],
  finance: ['Finance', 'Financial Analysis'],
  business: ['Business Strategy', 'Business Analysis'],
  git: ['Git', 'Version Control'],
  docker: ['Docker'],
  kubernetes: ['Kubernetes'],
  figma: ['Figma'],
}

const STOPWORDS = new Set(
  'a an and the to of for in on with by at from into about as is are be i im i\'m me my we want wanna would like learn learning become get start started how what some more course courses class classes study studying beginner beginners intermediate advanced basics basic skills skill using use do doing career job new good best want need please teach'.split(
    ' ',
  ),
)

const LEVEL_WORDS = { beginner: 'Beginner', beginners: 'Beginner', basics: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Advanced' }

const SYNONYM_PHRASES = Object.keys(SYNONYMS).filter((k) => k.includes(' ')).sort((a, b) => b.length - a.length)
const MAX_REVIEWS = Math.max(1, ...courses.map((c) => c.reviewCount ?? 0))

/**
 * Turn free text into "concepts". Each concept is one thing the learner asked
 * for, e.g. "ml" -> { word: "ml", terms: ["machine learning"] }. A course
 * covers a concept if a skill equals one of its terms (strong), a skill
 * contains the word (weaker) or the title contains the word / a term.
 */
function parseGoal(goalText) {
  let text = ` ${String(goalText ?? '').toLowerCase().replace(/[^\p{L}\p{N}+#.\s-]/gu, ' ').replace(/-/g, ' ')} `.replace(/\s+/g, ' ')
  const concepts = []
  for (const phrase of SYNONYM_PHRASES) {
    if (text.includes(` ${phrase} `)) {
      concepts.push({ word: phrase, terms: SYNONYMS[phrase].map((s) => s.toLowerCase()) })
      text = text.replaceAll(` ${phrase} `, ' ')
    }
  }
  for (const w of new Set(tokenize(text))) {
    if (STOPWORDS.has(w)) continue
    concepts.push({ word: w, terms: (SYNONYMS[w] ?? []).map((s) => s.toLowerCase()) })
  }
  return concepts.map((c) => ({ ...c, wordRe: new RegExp(`\\b${escapeRe(c.word)}`) }))
}

function scoreConcept(concept, ix) {
  let skill = 0
  const hits = []
  ix.skills.forEach((s, i) => {
    let hit = 0
    if (concept.terms.includes(s)) hit = 1
    else if (concept.word.length > 2 && concept.wordRe.test(s)) hit = 0.7
    // Skills are listed most-relevant first; late generic skills count a bit less.
    if (i >= 6) hit *= 0.8
    if (hit) {
      hits.push(i)
      skill = Math.max(skill, hit)
    }
  })
  const title = concept.wordRe.test(ix.title) || concept.terms.some((t) => ix.title.includes(t)) ? 1 : 0
  return { value: Math.max(skill, title) + 0.3 * Math.min(skill, title), hits }
}

export function recommendCourses(goalText, options = {}) {
  warnUnknownKeys('recommendCourses', options, RECOMMEND_KEYS)
  const { level, limit = 6 } = options ?? {}
  const text = String(goalText ?? '').trim()
  if (!text) return []
  const concepts = parseGoal(text)
  // undefined, "" and "Any" (or any non-level value) mean any level; the goal
  // text may still hint at one ("beginner python").
  const explicitLevel = LEVELS.find((l) => l.toLowerCase() === String(level ?? '').trim().toLowerCase()) ?? null
  const wantedLevel = explicitLevel || LEVEL_WORDS[tokenize(text).find((w) => LEVEL_WORDS[w])] || null
  if (!concepts.length) return []

  const scored = []
  for (const course of courses) {
    const ix = searchIndex.get(course.id)
    let coverage = 0
    const hitIdx = new Set()
    for (const concept of concepts) {
      const { value, hits } = scoreConcept(concept, ix)
      coverage += value
      hits.forEach((i) => hitIdx.add(i))
    }
    if (!coverage) continue
    coverage /= concepts.length // 0 .. 1.3: share of the goal this course covers

    const quality =
      (course.rating != null ? (course.rating / 5) * 0.6 : 0.3) +
      (course.reviewCount ? (Math.log10(course.reviewCount + 1) / Math.log10(MAX_REVIEWS + 1)) * 0.4 : 0)
    let levelFit = 0
    if (wantedLevel) {
      if (course.level === wantedLevel) levelFit = 1
      else if (course.level === 'Mixed') levelFit = 0.6
      else if (Math.abs(LEVEL_ORDER.indexOf(course.level) - LEVEL_ORDER.indexOf(wantedLevel)) === 1) levelFit = 0.2
    }

    // Breadth: courses that cover several of the matching skills rank higher.
    const breadth = Math.min(hitIdx.size, 4) / 4
    const raw = coverage * 3 + breadth * 0.6 + quality * 0.6 + levelFit * 0.6
    const matchedSkills = [...hitIdx].sort((a, b) => a - b).map((i) => course.skills[i]).slice(0, 5)
    scored.push({ course, raw, matchedSkills })
  }

  if (!scored.length) return []
  scored.sort((a, b) => b.raw - a.raw || byRating(a.course, b.course))
  const MAX_RAW = 1.3 * 3 + 0.6 + 0.6 + (wantedLevel ? 0.6 : 0)

  return scored.slice(0, limit).map(({ course, raw, matchedSkills }) => ({
    course,
    score: Math.round(Math.min(1, raw / MAX_RAW) * 100) / 100,
    matchedSkills,
    reason: buildReason(course, matchedSkills),
  }))
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildReason(course, matchedSkills) {
  const parts = []
  parts.push(matchedSkills.length ? `Matches ${matchedSkills.slice(0, 3).join(', ')}` : 'Title matches your goal')
  parts.push(course.level)
  if (course.rating != null) parts.push(`${course.rating}★`)
  return parts.join(' · ')
}
