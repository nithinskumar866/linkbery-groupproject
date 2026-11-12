#!/usr/bin/env node
// Builds src/data/courses.json from:
//   1. ../linkbery.csv            (source "csv")          - Coursera export with broken encoding
//   2. LEGACY_COURSES below       (source "legacy-site")  - courses the old static site linked to
//   3. scripts/sample-courses.json (source "sample")      - SAMPLE DATA, delete the file to remove it
// Usage: npm run data   (no dependencies)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const APP = resolve(here, '..')
const CSV_PATH = resolve(APP, '../linkbery.csv')
const SAMPLE_PATH = resolve(here, 'sample-courses.json')
const OUT_PATH = resolve(APP, 'src/data/courses.json')
const PATHS_PATH = resolve(APP, 'src/data/paths.json')

export const CATEGORY_SLUGS = [
  'development', 'coding', 'ui-ux', 'data-science', 'ai-ml', 'cybersecurity', 'cloud', 'math', 'software', 'science',
  'business', 'project-management', 'marketing', 'design', 'photography', 'music', 'film', 'fitness',
]
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Mixed']
const TYPES = ['Professional Certificate', 'Specialization', 'Course', 'Guided Project', 'Video Series', 'Bootcamp']
const PRICES = ['Free', 'Paid', 'Free to audit', null]
const SOURCES = ['csv', 'legacy-site', 'sample']

// ---------------------------------------------------------------------------
// Category inference: keyword rules matched against the title and the first
// few (most relevant) skills. Coursera lists generic soft skills such as
// "Leadership and Management" late in the list, so only the head is used.
// ---------------------------------------------------------------------------
const CATEGORY_RULES = [
  ['ai-ml', /machine learning|deep learning|artificial intelligence|\bai\b|neural network|reinforcement learning|natural language/],
  ['data-science', /data science|data analy|statistic|\bsql\b|tableau|big data|data visuali[sz]ation|data mining|\br programming/],
  ['cybersecurity', /cyber ?security|network security|cryptograph|ethical hacking|security incident/],
  ['cloud', /cloud|\baws\b|amazon web services|kubernetes|docker/],
  ['ui-ux', /user experience|\bux\b|\bui\b|figma|user research|interaction design|interactive design|human computer interaction/],
  ['design', /graphic design|visual design|product design|design and product|typography|innovation through design/],
  ['development', /web development|front-end|back-end|full[ -]stack|javascript|\bhtml\b|\breact\b/],
  ['coding', /python programming|computer programming|\balgorithms\b|\bjava\b/],
  ['software', /software engineering|software development|devops|version control|\bgit\b|software design|it support|computer networking|operating systems/],
  ['math', /linear algebra|calculus|mathemat|probability/],
  ['science', /physics|biology|chemistry|exercise physiology/],
  ['business', /business|finance|accounting|entrepreneur|economics|\bsales\b|e-commerce|strategy and operations/],
  ['project-management', /project management|\bscrum\b|\bagile\b/],
  ['marketing', /marketing|search engine optimization|\bseo\b|social media|advertising/],
  ['photography', /photograph/],
  ['music', /\bmusic|piano|guitar/],
  ['film', /film|cinematograph|video editing|animation/],
  ['fitness', /fitness|yoga|workout|exercise/],
]
const HEAD_SKILLS = 6

// Manual corrections where the keyword rules give a misleading result.
const CATEGORY_OVERRIDES = {
  // Head skills include "Cloud Computing" and "Algorithms", but it is a security certificate.
  'google-cybersecurity': ['cybersecurity', 'software'],
}

export function inferCategories(title, skills) {
  const text = [title, ...skills.slice(0, HEAD_SKILLS)].join(' | ').toLowerCase()
  return CATEGORY_RULES.filter(([, re]) => re.test(text)).map(([slug]) => slug)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function slugify(s) {
  return s
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f.trim() !== '')) rows.push(row)
      row = []
    } else field += ch
  }
  row.push(field)
  if (row.some((f) => f.trim() !== '')) rows.push(row)
  return rows
}

/** "140K" -> 140000, "7.3K" -> 7300, "1.2M" -> 1200000, "782" -> 782 */
export function parseCount(s) {
  const m = String(s).trim().match(/^([\d.,]+)\s*([KkMm]?)$/)
  if (!m) return null
  const n = parseFloat(m[1].replace(/,/g, ''))
  const mult = { k: 1e3, m: 1e6 }[m[2].toLowerCase()] ?? 1
  return Math.round(n * mult)
}

/** "4.8(140K reviews)" -> { rating: 4.8, reviewCount: 140000 } */
export function parseRatings(s) {
  const m = String(s).trim().match(/^([\d.]+)\s*\(\s*([\d.,]+\s*[KkMm]?)\s*reviews?\s*\)$/)
  if (!m) return { rating: null, reviewCount: null }
  return { rating: parseFloat(m[1]), reviewCount: parseCount(m[2]) }
}

// The CSV was saved with a broken encoding: the "·" separator became the bytes
// 0x82 0x20 0xB7 and "–" became 0xA2 0x80 0x20 0x93. Reading as latin1 keeps
// each garbage byte as one char in U+0080..U+00FF, and U+FFFD covers files
// that were already decoded as UTF-8.
const GARBAGE = '[\\u0080-\\u00ff\\ufffd]'
const SEP_RE = new RegExp(`\\s*${GARBAGE}(?:\\s*${GARBAGE})*\\s*`, 'g')
const cleanText = (s) => s.replace(new RegExp(`\\s*${GARBAGE}+\\s*`, 'g'), ' ').replace(/\s+/g, ' ').trim()

/** "Beginner  · Professional Certificate  · 3 - 6 Months" -> { level, type, duration } */
export function parseLevels(s) {
  const parts = s.split(/\s*\u0082\s*·\s*|\s*�\s*�\s*(?=[A-Z0-9])/).map((p) => p.trim()).filter(Boolean)
  const out = { level: null, type: null, duration: null }
  for (const raw of parts) {
    const p = raw.replace(SEP_RE, ' - ').replace(/\s+/g, ' ').trim()
    if (LEVELS.includes(p)) out.level = p
    else if (!out.type && !/\d/.test(p)) out.type = p
    else out.duration = p
  }
  return out
}

/** Skill list: trim, rejoin the "Extract, Transform, Load" triple, de-duplicate. */
export function parseSkills(s) {
  const raw = s.split(',').map((x) => x.trim()).filter(Boolean)
  const out = []
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === 'Extract' && raw[i + 1] === 'Transform' && raw[i + 2] === 'Load') {
      out.push('Extract Transform Load (ETL)')
      i += 2
    } else out.push(raw[i])
  }
  return [...new Set(out)]
}

const toUrl = (link) => {
  const l = link.trim().replace(/^https?:\/\//, '').replace(/^www\./, '')
  return `https://www.${l}`
}

// ---------------------------------------------------------------------------
// 1. CSV
// ---------------------------------------------------------------------------
// Types the contract allows; degree-style programmes (Degree, Mastertrack,
// Graduate Certificate) are not courses and their rows in the export have
// copy-pasted ratings and unrelated skill lists, so they are skipped.
function buildCsvCourses(log) {
  const text = readFileSync(CSV_PATH, 'latin1')
  const [header, ...rows] = parseCsv(text)
  const cols = header.map((h) => h.trim().toLowerCase())
  const idx = (name) => {
    const i = cols.indexOf(name)
    if (i < 0) throw new Error(`CSV is missing column "${name}" (have: ${cols.join(', ')})`)
    return i
  }
  const C = { provider: idx('provider'), title: idx('course name'), skills: idx('skills'), ratings: idx('ratings'), levels: idx('levels'), link: idx('links') }

  const out = []
  rows.forEach((r, n) => {
    const line = n + 2
    const title = cleanText(r[C.title]).replace(/[\s:;,-]+$/, '')
    const { level, type, duration } = parseLevels(r[C.levels])
    if (!TYPES.includes(type)) {
      log.push(`CSV line ${line}: skipped "${title}" (programme type "${type ?? r[C.levels].trim()}" is not a course type in the contract)`)
      return
    }
    const skills = parseSkills(r[C.skills])
    const { rating, reviewCount } = parseRatings(r[C.ratings])
    if (rating == null) log.push(`CSV line ${line}: could not parse ratings "${r[C.ratings]}"`)
    const id = slugify(title)
    out.push({
      id,
      title,
      provider: cleanText(r[C.provider]),
      platform: 'Coursera',
      url: toUrl(r[C.link]),
      description: null,
      skills,
      categories: CATEGORY_OVERRIDES[id] ?? inferCategories(title, skills),
      level: level ?? 'Mixed',
      type,
      duration,
      rating,
      reviewCount,
      price: type === 'Professional Certificate' || type === 'Specialization' || type === 'Guided Project' ? 'Paid' : 'Free to audit',
      image: null,
      source: 'csv',
      _line: line,
    })
  })
  return out
}

// ---------------------------------------------------------------------------
// 2. Courses that the legacy static site linked to
// ---------------------------------------------------------------------------
const LEGACY_COURSES = [
  {
    id: 'udemy-machine-learning-a-z',
    title: 'Machine Learning A-Z',
    provider: 'Kirill Eremenko & Hadelin de Ponteves',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/machinelearning/',
    description: 'A hands-on course covering regression, classification, clustering and deep learning in Python and R.',
    skills: ['Machine Learning', 'Python Programming', 'R Programming', 'Deep Learning', 'Data Science'],
    categories: ['ai-ml', 'data-science'],
    level: 'Beginner',
    type: 'Course',
    duration: null,
    rating: null,
    reviewCount: null,
    price: 'Paid',
    image: '/images/ml_udemy.jpg',
  },
  {
    id: 'ibm-back-end-development',
    title: 'IBM Back-End Development',
    provider: 'IBM',
    platform: 'Coursera',
    url: 'https://www.coursera.org/professional-certificates/ibm-backend-development',
    description: 'An 11-course professional certificate on back-end development with Python, Django, SQL, Docker and Kubernetes.',
    skills: ['Back-End Web Development', 'Python Programming', 'Django', 'SQL', 'Docker', 'Kubernetes', 'Git'],
    categories: ['development', 'cloud'],
    level: 'Beginner',
    type: 'Professional Certificate',
    duration: null,
    // Stated on the legacy site's IBM page ("a stellar rating of 4.6 from 460 reviews").
    rating: 4.6,
    reviewCount: 460,
    price: 'Paid',
    image: '/images/ibm_c.jpg',
  },
  {
    id: 'the-structured-query-language-sql',
    title: 'The Structured Query Language (SQL)',
    provider: 'University of Colorado Boulder',
    platform: 'Coursera',
    url: 'https://www.coursera.org/learn/the-structured-query-language-sql',
    description: 'An introduction to writing SQL queries against relational databases.',
    skills: ['SQL', 'Databases', 'Data Analysis'],
    categories: ['data-science', 'coding'],
    level: 'Beginner',
    type: 'Course',
    duration: null,
    rating: null,
    reviewCount: null,
    price: 'Free to audit',
    image: '/images/sql_c.jpg',
  },
  {
    // The legacy site linked to the Zen Class UI/UX bootcamp
    // (guvi.in/zen-class/ui-ux-design-course/), which GUVI discontinued: the URL
    // now redirects to a generic course listing. This is GUVI's current English
    // UI/UX course from that listing (checked 2026-11-12: 8 hours, paid, beginner).
    // The id is kept so existing links, saved lists and progress keep working.
    id: 'guvi-ui-ux-design-course',
    title: 'UX Design Fundamentals',
    provider: 'HCL GUVI',
    platform: 'Guvi',
    url: 'https://www.guvi.in/courses/ui-ux/ux-design-fundamentals/',
    description: 'A self-paced beginner course on UX principles, user research, personas, wireframing in Figma and usability testing.',
    skills: ['User Experience Design', 'User Research', 'Design Thinking', 'Wireframing', 'Figma', 'Usability Testing'],
    categories: ['ui-ux', 'design'],
    level: 'Beginner',
    type: 'Course',
    duration: '8 Hours',
    rating: null,
    reviewCount: null,
    price: 'Paid',
    image: '/images/guvi_ui.jpg',
  },
  {
    id: 'harvard-cs50-introduction-to-computer-science',
    title: "CS50's Introduction to Computer Science",
    provider: 'Harvard University',
    platform: 'edX',
    url: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science',
    description: "Harvard's introduction to computer science and programming, covering C, Python, SQL and web development.",
    skills: ['Computer Science', 'Computer Programming', 'C', 'Python Programming', 'Algorithms', 'SQL'],
    categories: ['coding', 'software'],
    level: 'Beginner',
    type: 'Course',
    duration: null,
    rating: null,
    reviewCount: null,
    price: 'Free to audit',
    image: '/images/edx_course.png',
  },
].map((c) => ({ ...c, source: 'legacy-site' }))

// ---------------------------------------------------------------------------
// 3. Sample data (clearly marked; remove scripts/sample-courses.json to drop)
// ---------------------------------------------------------------------------
function loadSample() {
  if (!existsSync(SAMPLE_PATH)) return []
  return JSON.parse(readFileSync(SAMPLE_PATH, 'utf8')).map((c) => ({
    description: null,
    duration: null,
    rating: null,
    reviewCount: null,
    price: null,
    image: null,
    ...c,
    categories: c.categories?.length ? c.categories : inferCategories(c.title, c.skills ?? []),
    source: 'sample',
  }))
}

// ---------------------------------------------------------------------------
// Validation: fail loudly
// ---------------------------------------------------------------------------
const FIELDS = ['id', 'title', 'provider', 'platform', 'url', 'description', 'skills', 'categories', 'level', 'type', 'duration', 'rating', 'reviewCount', 'price', 'image', 'source']

export function validate(courses) {
  const errors = []
  const ids = new Set()
  const urls = new Map()
  for (const c of courses) {
    const at = `course "${c.id ?? c.title ?? '?'}" (${c.source})`
    for (const f of FIELDS) if (!(f in c)) errors.push(`${at}: missing field "${f}"`)
    for (const f of Object.keys(c)) if (!FIELDS.includes(f)) errors.push(`${at}: unknown field "${f}"`)
    for (const f of ['id', 'title', 'provider', 'platform', 'url']) {
      if (typeof c[f] !== 'string' || !c[f].trim()) errors.push(`${at}: "${f}" must be a non-empty string`)
    }
    if (typeof c.id === 'string' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)) errors.push(`${at}: id is not kebab-case`)
    if (ids.has(c.id)) errors.push(`${at}: duplicate id`)
    ids.add(c.id)
    try {
      const u = new URL(c.url)
      if (u.protocol !== 'https:') errors.push(`${at}: url must be https`)
    } catch {
      errors.push(`${at}: invalid url "${c.url}"`)
    }
    if (urls.has(c.url)) errors.push(`${at}: duplicate url (also ${urls.get(c.url)})`)
    urls.set(c.url, c.id)
    if (!Array.isArray(c.skills) || !c.skills.length || c.skills.some((s) => typeof s !== 'string' || s !== s.trim() || !s)) errors.push(`${at}: skills must be a non-empty array of trimmed strings`)
    else if (new Set(c.skills).size !== c.skills.length) errors.push(`${at}: duplicate skills`)
    if (!Array.isArray(c.categories) || !c.categories.length) errors.push(`${at}: needs at least one category`)
    else for (const k of c.categories) if (!CATEGORY_SLUGS.includes(k)) errors.push(`${at}: unknown category "${k}"`)
    if (!LEVELS.includes(c.level)) errors.push(`${at}: invalid level "${c.level}"`)
    if (!TYPES.includes(c.type)) errors.push(`${at}: invalid type "${c.type}"`)
    if (!PRICES.includes(c.price)) errors.push(`${at}: invalid price "${c.price}"`)
    if (!SOURCES.includes(c.source)) errors.push(`${at}: invalid source "${c.source}"`)
    if (c.rating !== null && !(typeof c.rating === 'number' && c.rating >= 0 && c.rating <= 5)) errors.push(`${at}: rating must be 0-5 or null`)
    if (c.reviewCount !== null && !Number.isInteger(c.reviewCount)) errors.push(`${at}: reviewCount must be an integer or null`)
    if (c.description !== null && typeof c.description !== 'string') errors.push(`${at}: description must be string or null`)
    if (c.duration !== null && typeof c.duration !== 'string') errors.push(`${at}: duration must be string or null`)
    if (c.image !== null && !(typeof c.image === 'string' && c.image.startsWith('/images/'))) errors.push(`${at}: image must be /images/... or null`)
    if (/[\u0080-\u009f�]/.test(JSON.stringify(c))) errors.push(`${at}: contains broken-encoding characters`)
  }
  for (const slug of CATEGORY_SLUGS) {
    const n = courses.filter((c) => c.categories?.includes(slug)).length
    if (n < 2) errors.push(`category "${slug}" has only ${n} course(s); need at least 2`)
  }
  return errors
}

// ---------------------------------------------------------------------------
// Learning paths (src/data/paths.json, CONTRACT.md section 11)
// ---------------------------------------------------------------------------
const PATH_FIELDS = ['id', 'title', 'description', 'goal', 'level', 'categories', 'icon', 'steps']
const STEP_FIELDS = ['courseId', 'title', 'note', 'optional']
const PATH_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

/** Returns a list of error strings; empty when every path is valid. */
export function validatePaths(paths, courseIds) {
  const errors = []
  const known = new Set(courseIds)
  if (!Array.isArray(paths)) return ['paths.json must be an array']
  if (paths.length < 6 || paths.length > 8) errors.push(`expected 6-8 paths, found ${paths.length}`)
  const ids = new Set()
  for (const p of paths) {
    const at = `path "${p?.id ?? '?'}"`
    for (const f of PATH_FIELDS) if (!(f in p)) errors.push(`${at}: missing field "${f}"`)
    for (const f of Object.keys(p)) if (!PATH_FIELDS.includes(f)) errors.push(`${at}: unknown field "${f}"`)
    if (typeof p.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) errors.push(`${at}: id must be kebab-case`)
    if (ids.has(p.id)) errors.push(`${at}: duplicate path id`)
    ids.add(p.id)
    for (const f of ['title', 'description', 'goal', 'icon']) {
      if (typeof p[f] !== 'string' || !p[f].trim()) errors.push(`${at}: "${f}" must be a non-empty string`)
    }
    if (typeof p.icon === 'string' && !p.icon.startsWith('fa-')) errors.push(`${at}: icon must be a Font Awesome class like "fa-code"`)
    if (!PATH_LEVELS.includes(p.level)) errors.push(`${at}: invalid level "${p.level}"`)
    if (!Array.isArray(p.categories) || !p.categories.length) errors.push(`${at}: needs at least one category`)
    else for (const k of p.categories) if (!CATEGORY_SLUGS.includes(k)) errors.push(`${at}: unknown category "${k}"`)
    if (!Array.isArray(p.steps)) {
      errors.push(`${at}: steps must be an array`)
      continue
    }
    if (p.steps.length < 4 || p.steps.length > 6) errors.push(`${at}: expected 4-6 steps, found ${p.steps.length}`)
    if (!p.steps.some((s) => s.optional === false)) errors.push(`${at}: needs at least one required step`)
    const stepCourses = new Set()
    p.steps.forEach((s, i) => {
      const sat = `${at} step ${i + 1}`
      for (const f of STEP_FIELDS) if (!(f in s)) errors.push(`${sat}: missing field "${f}"`)
      for (const f of Object.keys(s)) if (!STEP_FIELDS.includes(f)) errors.push(`${sat}: unknown field "${f}"`)
      if (!known.has(s.courseId)) errors.push(`${sat}: unknown courseId "${s.courseId}"`)
      if (stepCourses.has(s.courseId)) errors.push(`${sat}: course "${s.courseId}" appears twice in this path`)
      stepCourses.add(s.courseId)
      for (const f of ['title', 'note']) if (typeof s[f] !== 'string' || !s[f].trim()) errors.push(`${sat}: "${f}" must be a non-empty string`)
      if (typeof s.optional !== 'boolean') errors.push(`${sat}: optional must be true or false`)
    })
  }
  return errors
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const log = []
  const csv = buildCsvCourses(log)

  // De-duplicate CSV rows by URL (the export lists Google UX Design twice).
  const byUrl = new Map()
  const csvCourses = []
  for (const c of csv) {
    if (byUrl.has(c.url)) {
      log.push(`CSV line ${c._line}: skipped duplicate of line ${byUrl.get(c.url)._line} ("${c.title}")`)
      continue
    }
    byUrl.set(c.url, c)
    csvCourses.push(c)
  }
  for (const c of csvCourses) {
    if (!c.categories.length) log.push(`CSV line ${c._line}: no category matched for "${c.title}"`)
    delete c._line
  }

  const all = [...csvCourses]
  const seen = new Set(all.map((c) => c.url))
  const seenIds = new Set(all.map((c) => c.id))
  for (const c of [...LEGACY_COURSES, ...loadSample()]) {
    if (seen.has(c.url) || seenIds.has(c.id)) {
      log.push(`skipped ${c.source} course "${c.title}" (duplicate of an existing course)`)
      continue
    }
    seen.add(c.url)
    seenIds.add(c.id)
    all.push(Object.fromEntries(FIELDS.map((f) => [f, c[f] ?? (f === 'skills' || f === 'categories' ? [] : null)])))
  }

  const errors = validate(all)
  // Paths reference course ids, so they are checked against the freshly built data.
  const paths = existsSync(PATHS_PATH) ? JSON.parse(readFileSync(PATHS_PATH, 'utf8')) : []
  errors.push(...validatePaths(paths, all.map((c) => c.id)).map((e) => `paths.json: ${e}`))
  log.forEach((l) => console.log(`  note: ${l}`))
  if (errors.length) {
    console.error(`\n${errors.length} validation error(s):`)
    errors.forEach((e) => console.error(`  - ${e}`))
    process.exit(1)
  }

  const json = '[\n' + all.map((c) => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n'
  writeFileSync(OUT_PATH, json)

  const count = (key) => {
    const m = {}
    for (const c of all) for (const v of [].concat(c[key])) m[v] = (m[v] || 0) + 1
    return m
  }
  console.log(`\nWrote ${all.length} courses to ${OUT_PATH}`)
  console.log('  by source:  ', count('source'))
  console.log('  by platform:', count('platform'))
  console.log('  by category:', count('categories'))
  console.log(`  paths:       ${paths.length} learning paths validated`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
