import { describe, expect, it } from 'vitest'
import {
  getAllCourses,
  getAllSkills,
  getCategories,
  getCategory,
  getCourseById,
  getOverallStats,
  getPlatformInsights,
  getPlatforms,
  getRelatedCourses,
  recommendCourses,
  searchCourses,
} from './courses.js'

const all = getAllCourses()

describe('data shape', () => {
  it('has unique ids and every category has at least 2 courses', () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length)
    for (const cat of getCategories()) {
      expect(all.filter((c) => c.categories.includes(cat.slug)).length, cat.slug).toBeGreaterThanOrEqual(2)
    }
  })

  it('looks up by id and category slug', () => {
    expect(getCourseById('google-data-analytics')?.title).toBe('Google Data Analytics')
    expect(getCourseById('nope')).toBeUndefined()
    expect(getCategory('ai-ml')?.name).toBe('AI & ML')
    expect(getCategory('nope')).toBeUndefined()
  })

  it('getPlatforms covers every platform in the data', () => {
    const names = new Set(getPlatforms().map((p) => p.name))
    for (const c of all) expect(names.has(c.platform)).toBe(true)
    expect(getPlatforms().find((p) => p.name === 'Coursera')).toMatchObject({ slug: 'coursera', logo: '/images/c.jpg' })
    expect(getPlatforms().find((p) => p.name === 'YouTube')?.logo).toBeNull()
  })

  it('getAllSkills is sorted by count desc and stable', () => {
    const skills = getAllSkills()
    for (let i = 1; i < skills.length; i++) expect(skills[i - 1].count).toBeGreaterThanOrEqual(skills[i].count)
    expect(getAllSkills()).toBe(skills)
  })
})

describe('searchCourses', () => {
  it('returns everything with no filters', () => {
    expect(searchCourses()).toHaveLength(all.length)
  })

  it('requires all query words to match (case-insensitive)', () => {
    const res = searchCourses({ query: 'GOOGLE ux' })
    expect(res.length).toBeGreaterThan(0)
    for (const c of res) {
      const text = [c.title, c.provider, c.platform, ...c.skills, c.description ?? ''].join(' ').toLowerCase()
      expect(text).toContain('google')
      expect(text).toContain('ux')
    }
    expect(searchCourses({ query: 'python zzzunknownzzz' })).toHaveLength(0)
  })

  it('ranks title matches above skill-only matches', () => {
    const res = searchCourses({ query: 'machine learning' })
    expect(res[0].title.toLowerCase()).toContain('machine learning')
    const firstSkillOnly = res.findIndex((c) => !c.title.toLowerCase().includes('machine'))
    const lastTitle = res.map((c) => c.title.toLowerCase().includes('machine learning')).lastIndexOf(true)
    if (firstSkillOnly >= 0) expect(lastTitle).toBeLessThan(firstSkillOnly)
  })

  it('filters by category (OR), level, platform, price', () => {
    const res = searchCourses({ categories: ['music', 'film'] })
    expect(res.length).toBeGreaterThanOrEqual(4)
    expect(res.every((c) => c.categories.includes('music') || c.categories.includes('film'))).toBe(true)

    expect(searchCourses({ levels: ['Intermediate'] }).every((c) => c.level === 'Intermediate')).toBe(true)
    const udemyEdx = searchCourses({ platforms: ['Udemy', 'edX'] })
    expect(udemyEdx.length).toBeGreaterThan(0)
    expect(udemyEdx.every((c) => ['Udemy', 'edX'].includes(c.platform))).toBe(true)
    expect(searchCourses({ price: ['Free'] }).every((c) => c.price === 'Free')).toBe(true)
  })

  it('requires ALL listed skills', () => {
    const res = searchCourses({ skills: ['Python Programming', 'Machine Learning'] })
    expect(res.length).toBeGreaterThan(0)
    expect(res.every((c) => c.skills.includes('Python Programming') && c.skills.includes('Machine Learning'))).toBe(true)
  })

  it('minRating excludes null ratings', () => {
    const res = searchCourses({ minRating: 4.7 })
    expect(res.length).toBeGreaterThan(0)
    expect(res.every((c) => c.rating != null && c.rating >= 4.7)).toBe(true)
  })

  it('sorts by rating, reviews and title', () => {
    const byRating = searchCourses({ sort: 'rating' })
    const rated = byRating.filter((c) => c.rating != null)
    for (let i = 1; i < rated.length; i++) expect(rated[i - 1].rating).toBeGreaterThanOrEqual(rated[i].rating)
    expect(byRating.slice(0, rated.length).every((c) => c.rating != null)).toBe(true)

    const byReviews = searchCourses({ sort: 'reviews' })
    expect(byReviews[0].reviewCount).toBe(Math.max(...all.map((c) => c.reviewCount ?? 0)))

    const byTitle = searchCourses({ sort: 'title' }).map((c) => c.title)
    expect(byTitle).toEqual([...byTitle].sort((a, b) => a.localeCompare(b)))
  })

  it('does not mutate the shared course list', () => {
    const before = all.map((c) => c.id)
    searchCourses({ sort: 'title' })
    expect(getAllCourses().map((c) => c.id)).toEqual(before)
  })
})

describe('getRelatedCourses', () => {
  it('excludes itself, respects limit and shares a skill or category', () => {
    const base = getCourseById('google-ux-design')
    const related = getRelatedCourses(base.id, 3)
    expect(related).toHaveLength(3)
    for (const c of related) {
      expect(c.id).not.toBe(base.id)
      expect(c.skills.some((s) => base.skills.includes(s)) || c.categories.some((k) => base.categories.includes(k))).toBe(true)
    }
    expect(getRelatedCourses('nope')).toEqual([])
  })
})

describe('getPlatformInsights', () => {
  const insights = getPlatformInsights()

  it('covers all courses and is sorted by course count', () => {
    expect(insights.reduce((s, i) => s + i.courseCount, 0)).toBe(all.length)
    for (let i = 1; i < insights.length; i++) expect(insights[i - 1].courseCount).toBeGreaterThanOrEqual(insights[i].courseCount)
  })

  it('computes averages, totals, levels, skills and categories correctly', () => {
    for (const ins of insights) {
      const list = all.filter((c) => c.platform === ins.platform.name)
      expect(ins.courseCount).toBe(list.length)
      const rated = list.filter((c) => c.rating != null)
      if (rated.length) {
        const avg = rated.reduce((s, c) => s + c.rating, 0) / rated.length
        expect(ins.avgRating).toBeCloseTo(avg, 2)
      } else {
        expect(ins.avgRating).toBeNull()
      }
      expect(ins.totalReviews).toBe(list.reduce((s, c) => s + (c.reviewCount ?? 0), 0))
      expect(Object.values(ins.levels).reduce((a, b) => a + b, 0)).toBe(list.length)
      expect(ins.topSkills.length).toBeLessThanOrEqual(5)
      for (const { name, count } of ins.topSkills) expect(count).toBe(list.filter((c) => c.skills.includes(name)).length)
      for (const [slug, n] of Object.entries(ins.categories)) expect(n).toBe(list.filter((c) => c.categories.includes(slug)).length)
    }
  })

  it('Coursera numbers match a hand calculation over CSV + legacy rows', () => {
    const coursera = insights.find((i) => i.platform.name === 'Coursera')
    // 17 CSV rows (986,982 reviews, ratings sum 79.7) + legacy IBM Back-End (4.6, 460 reviews).
    // Sample Coursera courses have null ratings/reviews and must not affect these numbers.
    expect(coursera.totalReviews).toBe(986_982 + 460)
    expect(coursera.avgRating).toBe(4.68) // (79.7 + 4.6) / 18 = 4.683 -> 2 dp
  })

  it('overall stats are consistent', () => {
    const s = getOverallStats()
    expect(s.courseCount).toBe(all.length)
    expect(s.platformCount).toBe(getPlatforms().length)
    expect(s.skillCount).toBe(getAllSkills().length)
    expect(s.avgRating).toBeGreaterThan(0)
  })
})

describe('recommendCourses', () => {
  it('returns [] for an empty goal', () => {
    expect(recommendCourses('')).toEqual([])
    expect(recommendCourses('   ')).toEqual([])
  })

  it('"learn ml with python" returns ML/Python courses first', () => {
    const res = recommendCourses('learn ml with python')
    expect(res.length).toBe(6)
    for (const r of res.slice(0, 3)) {
      expect(r.matchedSkills.some((s) => /machine learning|python/i.test(s))).toBe(true)
    }
    expect(res[0].matchedSkills).toEqual(expect.arrayContaining(['Machine Learning']))
    for (const r of res) {
      expect(r.score).toBeGreaterThan(0)
      expect(r.score).toBeLessThanOrEqual(1)
      expect(typeof r.reason).toBe('string')
    }
    for (let i = 1; i < res.length; i++) expect(res[i - 1].score).toBeGreaterThanOrEqual(res[i].score)
  })

  it('expands synonyms (js -> JavaScript, ui ux, dsa)', () => {
    expect(recommendCourses('js')[0].matchedSkills).toContain('JavaScript')
    expect(recommendCourses('ui ux')[0].course.categories).toContain('ui-ux')
    expect(recommendCourses('dsa').some((r) => r.matchedSkills.includes('Data Structures'))).toBe(true)
    expect(recommendCourses('become a data analyst')[0].course.categories).toContain('data-science')
  })

  it('builds a readable reason', () => {
    const [top] = recommendCourses('machine learning python', { limit: 1 })
    expect(top.reason).toMatch(/^Matches .+ · (Beginner|Intermediate|Advanced|Mixed)/)
    if (top.course.rating != null) expect(top.reason).toContain(`${top.course.rating}★`)
  })

  it('uses level fit and limit', () => {
    const res = recommendCourses('deep learning', { level: 'Intermediate', limit: 3 })
    expect(res).toHaveLength(3)
    expect(res[0].course.level).toBe('Intermediate')
  })

  it('returns [] when nothing matches', () => {
    expect(recommendCourses('zzqqxx')).toEqual([])
  })
})
