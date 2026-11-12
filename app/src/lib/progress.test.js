import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from './test-utils.js'

const storage = installMemoryStorage()
const auth = await import('./auth.js')
const progress = await import('./progress.js')
const { getAllCourses } = await import('./courses.js')

const [c1, c2] = getAllCourses().map((c) => c.id)

beforeEach(async () => {
  await auth.logOut()
  storage.clear()
})

describe('progress tracking', () => {
  it('guests get an empty map and cannot set a status', () => {
    expect(progress.STATUSES).toEqual(['planning', 'in-progress', 'completed'])
    expect(progress.getProgress()).toEqual({})
    expect(progress.getStatus(c1)).toBeNull()
    expect(() => progress.setStatus(c1, 'planning')).toThrow('Please log in to track your progress')
  })

  it('sets, changes and removes a status', async () => {
    const user = await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    progress.setStatus(c1, 'planning')
    expect(progress.getStatus(c1)).toBe('planning')
    progress.setStatus(c1, 'completed')
    expect(progress.getProgress()[c1]).toMatchObject({ status: 'completed' })
    expect(typeof progress.getProgress()[c1].updatedAt).toBe('string')
    expect(JSON.parse(storage.getItem(`linkbery.progress.${user.id}`))[c1].status).toBe('completed')
    progress.setStatus(c1, null)
    expect(progress.getStatus(c1)).toBeNull()
    expect(progress.getProgress()).toEqual({})
  })

  it('rejects unknown statuses and courses', async () => {
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    expect(() => progress.setStatus(c1, 'done')).toThrow(/Unknown status/)
    expect(() => progress.setStatus('no-such-course', 'planning')).toThrow()
    expect(progress.getProgress()).toEqual({})
  })

  it('keeps each user separate and switches on login/logout', async () => {
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    progress.setStatus(c1, 'in-progress')

    await auth.signUp({ name: 'B', email: 'b@x.io', password: 'secret1' })
    expect(progress.getProgress()).toEqual({})
    progress.setStatus(c2, 'completed')

    await auth.logIn({ email: 'a@x.io', password: 'secret1' })
    expect(progress.getStatus(c1)).toBe('in-progress')
    expect(progress.getStatus(c2)).toBeNull()

    await auth.logOut()
    expect(progress.getProgress()).toEqual({})
  })

  it('returns a stable object and notifies on change and user switch', async () => {
    const listener = vi.fn()
    const unsub = progress.subscribeProgress(listener)
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    expect(listener).toHaveBeenCalled()

    const before = progress.getProgress()
    expect(progress.getProgress()).toBe(before)
    progress.setStatus(c1, 'planning')
    const after = progress.getProgress()
    expect(after).not.toBe(before)
    expect(progress.getProgress()).toBe(after)
    expect(listener).toHaveBeenLastCalledWith(after)

    await auth.logOut()
    expect(listener).toHaveBeenLastCalledWith({})
    unsub()
  })

  it('ignores unknown courses and bad statuses in storage', async () => {
    const user = await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    storage.setItem(
      `linkbery.progress.${user.id}`,
      JSON.stringify({ gone: { status: 'completed' }, [c1]: { status: 'weird' }, [c2]: { status: 'planning', updatedAt: 'x' } }),
    )
    expect(progress.getProgress()).toEqual({ [c2]: { status: 'planning', updatedAt: 'x' } })
  })
})
