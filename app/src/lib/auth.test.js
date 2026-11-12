import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from './test-utils.js'

const storage = installMemoryStorage()
const auth = await import('./auth.js')

beforeEach(async () => {
  storage.clear()
  await auth.logOut()
})

describe('auth (localStorage demo)', () => {
  it('signs up, normalises email, logs in and never exposes hash/salt', async () => {
    const user = await auth.signUp({ name: '  Asha  ', email: '  Asha@Example.COM ', password: 'secret1' })
    expect(user).toMatchObject({ name: 'Asha', email: 'asha@example.com', role: 'Student', avatar: null })
    expect(user).not.toHaveProperty('hash')
    expect(user).not.toHaveProperty('salt')
    expect(auth.getCurrentUser()).toEqual(user)

    const stored = JSON.parse(storage.getItem('linkbery.users'))[0]
    expect(stored.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(stored.salt).toMatch(/^[0-9a-f]{32}$/)
    expect(JSON.stringify(stored)).not.toContain('secret1')

    await auth.logOut()
    expect(auth.getCurrentUser()).toBeNull()
    const again = await auth.logIn({ email: 'ASHA@example.com', password: 'secret1' })
    expect(again.id).toBe(user.id)
  })

  it('uses a per-user salt', async () => {
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'samepass' })
    await auth.signUp({ name: 'B', email: 'b@x.io', password: 'samepass' })
    const [a, b] = JSON.parse(storage.getItem('linkbery.users'))
    expect(a.salt).not.toBe(b.salt)
    expect(a.hash).not.toBe(b.hash)
  })

  it('rejects duplicate emails, weak passwords, bad emails and missing names', async () => {
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    await expect(auth.signUp({ name: 'B', email: ' A@X.io', password: 'secret1' })).rejects.toThrow(/already exists/)
    await expect(auth.signUp({ name: 'B', email: 'b@x.io', password: '123' })).rejects.toThrow(/at least 6/)
    await expect(auth.signUp({ name: 'B', email: 'not-an-email', password: 'secret1' })).rejects.toThrow(/valid email/)
    await expect(auth.signUp({ name: '  ', email: 'c@x.io', password: 'secret1' })).rejects.toThrow(/name/)
  })

  it('rejects a wrong password or unknown email with the same message', async () => {
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    await auth.logOut()
    await expect(auth.logIn({ email: 'a@x.io', password: 'wrong!!' })).rejects.toThrow('Invalid email or password')
    await expect(auth.logIn({ email: 'nobody@x.io', password: 'secret1' })).rejects.toThrow('Invalid email or password')
    expect(auth.getCurrentUser()).toBeNull()
  })

  it('getCurrentUser returns a stable reference until something changes', async () => {
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    const u1 = auth.getCurrentUser()
    expect(auth.getCurrentUser()).toBe(u1)
    const u2 = await auth.updateProfile({ name: 'Anna' })
    expect(u2).not.toBe(u1)
    expect(u2.name).toBe('Anna')
    expect(auth.getCurrentUser()).toBe(u2)
  })

  it('notifies subscribers and supports unsubscribe', async () => {
    const listener = vi.fn()
    const unsub = auth.subscribeAuth(listener)
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ email: 'a@x.io' }))
    await auth.logOut()
    expect(listener).toHaveBeenLastCalledWith(null)
    unsub()
    listener.mockClear()
    await auth.logIn({ email: 'a@x.io', password: 'secret1' })
    expect(listener).not.toHaveBeenCalled()
  })

  it('updateProfile checks duplicate emails and changePassword verifies the old one', async () => {
    await auth.signUp({ name: 'B', email: 'b@x.io', password: 'secret1' })
    await auth.signUp({ name: 'A', email: 'a@x.io', password: 'secret1' })
    await expect(auth.updateProfile({ email: 'B@x.io' })).rejects.toThrow(/already uses/)
    const u = await auth.updateProfile({ email: 'new@x.io', avatar: '/images/pic-1.jpg' })
    expect(u).toMatchObject({ email: 'new@x.io', avatar: '/images/pic-1.jpg' })

    await expect(auth.changePassword({ oldPassword: 'nope!!', newPassword: 'another1' })).rejects.toThrow(/incorrect/)
    await expect(auth.changePassword({ oldPassword: 'secret1', newPassword: '123' })).rejects.toThrow(/at least 6/)
    await auth.changePassword({ oldPassword: 'secret1', newPassword: 'another1' })
    await auth.logOut()
    await expect(auth.logIn({ email: 'new@x.io', password: 'secret1' })).rejects.toThrow()
    await expect(auth.logIn({ email: 'new@x.io', password: 'another1' })).resolves.toMatchObject({ email: 'new@x.io' })
  })

  it('requires a session for profile changes', async () => {
    await expect(auth.updateProfile({ name: 'X' })).rejects.toThrow(/log in/)
    await expect(auth.changePassword({ oldPassword: 'a', newPassword: 'bbbbbb' })).rejects.toThrow(/log in/)
  })
})
