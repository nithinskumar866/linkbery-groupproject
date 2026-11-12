import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from './test-utils.js'

const storage = installMemoryStorage()
const auth = await import('./auth.js')
const saved = await import('./saved.js')
const { getAllCourses } = await import('./courses.js')

const [c1, c2] = getAllCourses()

beforeEach(async () => {
  await auth.logOut()
  storage.clear()
})

describe('saved courses', () => {
  it('guests get an empty list and cannot save', () => {
    expect(saved.getSavedIds()).toEqual([])
    expect(saved.isSaved(c1.id)).toBe(false)
    expect(() => saved.toggleSaved(c1.id)).toThrow('Please log in to save courses')
  })

  it('toggles per user and keeps lists separate', async () => {
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    expect(saved.toggleSaved(c1.id)).toBe(true)
    expect(saved.toggleSaved(c2.id)).toBe(true)
    expect(saved.getSavedIds()).toEqual([c1.id, c2.id])
    expect(saved.toggleSaved(c1.id)).toBe(false)
    expect(saved.getSavedIds()).toEqual([c2.id])

    await auth.signUp({ name: 'B', email: 'b@x.io', password: 'secret1' })
    expect(saved.getSavedIds()).toEqual([])
    saved.toggleSaved(c1.id)
    expect(saved.getSavedIds()).toEqual([c1.id])

    await auth.logIn({ email: 'a@x.io', password: 'secret1' })
    expect(saved.getSavedIds()).toEqual([c2.id])
    await auth.logOut()
    expect(saved.getSavedIds()).toEqual([])
  })

  it('returns a stable array reference and notifies on change and on user switch', async () => {
    const listener = vi.fn()
    const unsub = saved.subscribeSaved(listener)
    const user = await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    expect(listener).toHaveBeenCalled() // user changed

    const before = saved.getSavedIds()
    expect(saved.getSavedIds()).toBe(before)
    saved.toggleSaved(c1.id)
    const after = saved.getSavedIds()
    expect(after).not.toBe(before)
    expect(saved.getSavedIds()).toBe(after)
    expect(listener).toHaveBeenLastCalledWith([c1.id])

    expect(storage.getItem(`linkbery.saved.${user.id}`)).toBe(JSON.stringify([c1.id]))
    await auth.logOut()
    expect(listener).toHaveBeenLastCalledWith([])
    unsub()
  })

  it('ignores ids that no longer exist in the data', async () => {
    const user = await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    storage.setItem(`linkbery.saved.${user.id}`, JSON.stringify(['removed-course', c1.id, c1.id]))
    expect(saved.getSavedIds()).toEqual([c1.id])
  })
})
