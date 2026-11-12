import { describe, expect, it } from 'vitest'
import rawPaths from '../data/paths.json'
import { validatePaths } from '../../scripts/build-courses.mjs'
import { getAllCourses, getCategory, getCourseById } from './courses.js'
import { getAllPaths, getPathById, getPathProgress, getPathsForCourse } from './paths.js'

const courseIds = getAllCourses().map((c) => c.id)

describe('paths.json', () => {
  it('passes validation: known course ids, unique ids, 6-8 paths of 4-6 steps', () => {
    expect(validatePaths(rawPaths, courseIds)).toEqual([])
    expect(new Set(rawPaths.map((p) => p.id)).size).toBe(rawPaths.length)
    for (const p of rawPaths) {
      for (const s of p.steps) expect(getCourseById(s.courseId), `${p.id}: ${s.courseId}`).toBeDefined()
      for (const k of p.categories) expect(getCategory(k), `${p.id}: ${k}`).toBeDefined()
    }
  })

  it('validation catches unknown course ids and duplicate ids', () => {
    const bad = structuredClone(rawPaths)
    bad[0].steps[0].courseId = 'no-such-course'
    bad[1].id = bad[2].id
    const errors = validatePaths(bad, courseIds)
    expect(errors.some((e) => e.includes('unknown courseId "no-such-course"'))).toBe(true)
    expect(errors.some((e) => e.includes('duplicate path id'))).toBe(true)
  })

  it('exposes the same paths with no steps dropped', () => {
    expect(getAllPaths().map((p) => p.id)).toEqual(rawPaths.map((p) => p.id))
    getAllPaths().forEach((p, i) => expect(p.steps.length).toBe(rawPaths[i].steps.length))
  })
})

describe('paths API', () => {
  it('looks up paths by id and by course', () => {
    expect(getPathById('data-analyst')?.title).toBe('Become a Data Analyst')
    expect(getPathById('nope')).toBeUndefined()
    const forCourse = getPathsForCourse('atlassian-version-control-with-git').map((p) => p.id)
    expect(forCourse).toContain('web-developer')
    expect(forCourse).toContain('cloud-devops')
    expect(getPathsForCourse('nope')).toEqual([])
  })

  it('getPathProgress excludes optional steps and is pure', () => {
    const path = getPathById('data-analyst')
    const required = path.steps.filter((s) => !s.optional)
    const optional = path.steps.filter((s) => s.optional)
    expect(optional.length).toBeGreaterThan(0)

    expect(getPathProgress('data-analyst', {})).toEqual({ completed: 0, inProgress: 0, total: required.length, percent: 0 })

    const map = {
      [required[0].courseId]: { status: 'completed', updatedAt: 'x' },
      [required[1].courseId]: { status: 'in-progress', updatedAt: 'x' },
      [optional[0].courseId]: { status: 'completed', updatedAt: 'x' }, // not counted
    }
    const snapshot = JSON.stringify(map)
    expect(getPathProgress('data-analyst', map)).toEqual({
      completed: 1,
      inProgress: 1,
      total: required.length,
      percent: Math.round((1 / required.length) * 100),
    })
    expect(JSON.stringify(map)).toBe(snapshot)

    const allDone = Object.fromEntries(required.map((s) => [s.courseId, { status: 'completed' }]))
    expect(getPathProgress('data-analyst', allDone).percent).toBe(100)
  })

  it('handles unknown paths and missing maps', () => {
    expect(getPathProgress('nope', {})).toEqual({ completed: 0, inProgress: 0, total: 0, percent: 0 })
    expect(getPathProgress('data-analyst').completed).toBe(0)
    expect(getPathProgress('data-analyst', null).completed).toBe(0)
  })
})
