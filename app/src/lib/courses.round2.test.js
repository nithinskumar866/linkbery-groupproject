import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LEVELS,
  PRICES,
  getAllCourses,
  getCategories,
  getCompareSummary,
  getFacetCounts,
  getPlatforms,
  recommendCourses,
  searchCourses,
} from './courses.js'

const all = getAllCourses()

afterEach(() => vi.restoreAllMocks())

describe('LEVELS / PRICES', () => {
  it('match the contract and cover the data', () => {
    expect(LEVELS).toEqual(['Beginner', 'Intermediate', 'Advanced', 'Mixed'])
    expect(PRICES).toEqual(['Free', 'Free to audit', 'Paid'])
    for (const c of all) {
      expect(LEVELS).toContain(c.level)
      if (c.price != null) expect(PRICES).toContain(c.price)
    }
  })
})

describe('getFacetCounts', () => {
  it('lists every known option, with 0 allowed', () => {
    const counts = getFacetCounts({ query: 'piano' })
    expect(Object.keys(counts.categories).sort()).toEqual(getCategories().map((c) => c.slug).sort())
    expect(Object.keys(counts.levels)).toEqual(LEVELS)
    expect(Object.keys(counts.platforms).sort()).toEqual(getPlatforms().map((p) => p.name).sort())
    expect(Object.keys(counts.price)).toEqual(PRICES)
    expect(counts.categories.cybersecurity).toBe(0)
  })

  it('with no filters, counts every course per option', () => {
    const counts = getFacetCounts({})
    for (const level of LEVELS) expect(counts.levels[level]).toBe(all.filter((c) => c.level === level).length)
    for (const cat of getCategories()) {
      expect(counts.categories[cat.slug]).toBe(all.filter((c) => c.categories.includes(cat.slug)).length)
    }
    expect(getFacetCounts()).toEqual(counts)
  })

  it('a selected facet does not zero out its own siblings', () => {
    const counts = getFacetCounts({ levels: ['Beginner'] })
    // Level counts ignore the level selection itself...
    expect(counts.levels.Intermediate).toBe(all.filter((c) => c.level === 'Intermediate').length)
    expect(counts.levels.Intermediate).toBeGreaterThan(0)
    expect(counts.levels.Beginner).toBe(searchCourses({ levels: ['Beginner'] }).length)
    // ...but other facets are narrowed by it.
    expect(counts.platforms.Udemy).toBe(searchCourses({ levels: ['Beginner'], platforms: ['Udemy'] }).length)
    expect(counts.platforms.Udemy).toBeLessThan(all.filter((c) => c.platform === 'Udemy').length)
  })

  it('each option count equals the search result of applying that option', () => {
    const filters = { query: 'data', categories: ['data-science'], price: ['Paid'], minRating: 0 }
    const counts = getFacetCounts(filters)
    for (const level of LEVELS) {
      expect(counts.levels[level], level).toBe(searchCourses({ ...filters, levels: [level] }).length)
    }
    for (const price of PRICES) {
      expect(counts.price[price], price).toBe(searchCourses({ ...filters, price: [price] }).length)
    }
    for (const { slug } of getCategories()) {
      expect(counts.categories[slug], slug).toBe(searchCourses({ ...filters, categories: [slug] }).length)
    }
    for (const { name } of getPlatforms()) {
      expect(counts.platforms[name], name).toBe(searchCourses({ ...filters, platforms: [name] }).length)
    }
  })

  it('applies query, skills and minRating to every facet', () => {
    const counts = getFacetCounts({ minRating: 4.7 })
    expect(counts.platforms.YouTube).toBe(0) // no YouTube course has a rating
    expect(counts.platforms.Coursera).toBe(searchCourses({ minRating: 4.7, platforms: ['Coursera'] }).length)
  })
})

describe('getCompareSummary', () => {
  it('keeps id order and drops unknown ids', () => {
    const s = getCompareSummary(['machine-learning', 'nope', 'google-data-analytics'])
    expect(s.courses.map((c) => c.id)).toEqual(['machine-learning', 'google-data-analytics'])
    expect(Object.keys(s.uniqueSkills)).toEqual(['machine-learning', 'google-data-analytics'])
  })

  it('computes shared and unique skills', () => {
    const ids = ['google-data-analytics', 'ibm-data-analyst']
    const s = getCompareSummary(ids)
    const [a, b] = s.courses
    expect(s.sharedSkills.length).toBeGreaterThan(0)
    for (const skill of s.sharedSkills) {
      expect(a.skills).toContain(skill)
      expect(b.skills).toContain(skill)
    }
    for (const skill of s.uniqueSkills[a.id]) expect(b.skills).not.toContain(skill)
    expect(s.uniqueSkills[a.id].length + s.sharedSkills.length).toBe(a.skills.length)
  })

  it('has no shared skills for fewer than 2 courses', () => {
    expect(getCompareSummary(['machine-learning']).sharedSkills).toEqual([])
    expect(getCompareSummary([])).toEqual({ courses: [], sharedSkills: [], uniqueSkills: {}, best: { rating: null, reviews: null } })
  })

  it('picks the best rating and reviews, null on tie or no data', () => {
    // machine-learning is rated 4.9, google-data-analytics 4.8.
    const s = getCompareSummary(['google-data-analytics', 'machine-learning'])
    expect(s.best.rating).toBe('machine-learning')
    const top = [...s.courses].sort((x, y) => y.reviewCount - x.reviewCount)[0]
    expect(s.best.reviews).toBe(top.id)

    // Two courses rated 4.8: a tie.
    expect(getCompareSummary(['google-data-analytics', 'google-project-management']).best.rating).toBeNull()
    // No ratings at all.
    expect(getCompareSummary(['yoga-with-adriene', 'film-riot']).best).toEqual({ rating: null, reviews: null })
  })
})

describe('recommendCourses level option', () => {
  it('treats undefined, "" and "Any" as any level', () => {
    const base = recommendCourses('machine learning').map((r) => r.course.id)
    expect(recommendCourses('machine learning', { level: '' }).map((r) => r.course.id)).toEqual(base)
    expect(recommendCourses('machine learning', { level: 'Any' }).map((r) => r.course.id)).toEqual(base)
    expect(recommendCourses('machine learning', { level: undefined }).map((r) => r.course.id)).toEqual(base)
  })

  it('still boosts an explicit level', () => {
    const res = recommendCourses('deep learning', { level: 'Intermediate' })
    expect(res[0].course.level).toBe('Intermediate')
  })
})

describe('unknown option keys (integration rule)', () => {
  it('warns in development for misspelled keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    searchCourses({ q: 'python' })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(/searchCourses.*"q"/)

    getFacetCounts({ level: ['Beginner'] })
    expect(warn.mock.calls[1][0]).toMatch(/getFacetCounts.*"level"/)

    recommendCourses('python', { levels: 'Beginner' })
    expect(warn.mock.calls[2][0]).toMatch(/recommendCourses.*"levels"/)
  })

  it('does not warn for valid keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    searchCourses({ query: 'python', categories: [], skills: [], levels: [], platforms: [], minRating: 0, price: [], sort: 'rating' })
    getFacetCounts({ query: 'python', sort: 'title' })
    recommendCourses('python', { level: 'Any', limit: 3 })
    recommendCourses('python')
    expect(warn).not.toHaveBeenCalled()
  })
})
