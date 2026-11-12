import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from './test-utils.js'

const storage = installMemoryStorage()
const compare = await import('./compare.js')
const { getAllCourses } = await import('./courses.js')

const [c1, c2, c3, c4] = getAllCourses().map((c) => c.id)

beforeEach(() => {
  storage.clear()
})

describe('compare list', () => {
  it('starts empty and works for guests', () => {
    expect(compare.MAX_COMPARE).toBe(3)
    expect(compare.getCompareIds()).toEqual([])
    compare.addToCompare(c1)
    expect(compare.getCompareIds()).toEqual([c1])
    expect(storage.getItem('linkbery.compare')).toBe(JSON.stringify([c1]))
  })

  it('ignores duplicates and enforces the max', () => {
    compare.addToCompare(c1)
    compare.addToCompare(c1)
    compare.addToCompare(c2)
    compare.addToCompare(c3)
    expect(compare.getCompareIds()).toEqual([c1, c2, c3])
    expect(() => compare.addToCompare(c4)).toThrow('You can compare up to 3 courses. Remove one first.')
    compare.addToCompare(c2) // present: no-op, does not throw even when full
    expect(compare.getCompareIds()).toEqual([c1, c2, c3])
  })

  it('removes and clears', () => {
    compare.addToCompare(c1)
    compare.addToCompare(c2)
    compare.removeFromCompare(c1)
    expect(compare.getCompareIds()).toEqual([c2])
    compare.removeFromCompare('not-there')
    compare.clearCompare()
    expect(compare.getCompareIds()).toEqual([])
  })

  it('returns a stable reference between changes and notifies listeners', () => {
    const listener = vi.fn()
    const unsub = compare.subscribeCompare(listener)
    const before = compare.getCompareIds()
    expect(compare.getCompareIds()).toBe(before)
    compare.addToCompare(c1)
    const after = compare.getCompareIds()
    expect(after).not.toBe(before)
    expect(compare.getCompareIds()).toBe(after)
    expect(listener).toHaveBeenLastCalledWith([c1])
    unsub()
    compare.addToCompare(c2)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('ignores unknown ids and bad data in storage', () => {
    storage.setItem('linkbery.compare', JSON.stringify(['gone', c1, c1, 42]))
    expect(compare.getCompareIds()).toEqual([c1])
    storage.setItem('linkbery.compare', '{not json')
    expect(compare.getCompareIds()).toEqual([])
    expect(() => compare.addToCompare('gone')).toThrow()
  })

  it('picks up changes made by another tab', () => {
    compare.addToCompare(c1)
    storage.setItem('linkbery.compare', JSON.stringify([c2, c3]))
    expect(compare.getCompareIds()).toEqual([c2, c3])
  })
})
