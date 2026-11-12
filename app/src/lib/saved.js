// Saved courses per logged-in user, stored in localStorage (CONTRACT.md section 5).
// Key: linkbery.saved.<userId>. Guests get an empty list.
import { getCurrentUser, subscribeAuth } from './auth.js'
import { getCourseById } from './courses.js'

const PREFIX = 'linkbery.saved.'
const EMPTY = Object.freeze([])

function storage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage
  } catch {
    // ignore
  }
  return null
}

function readRaw(key) {
  try {
    return storage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

// Snapshot cache so getSavedIds() returns a stable array between changes.
let snapUserId = null
let snapRaw
let snapIds = EMPTY

export function getSavedIds() {
  const user = getCurrentUser()
  if (!user) {
    snapUserId = null
    snapRaw = undefined
    snapIds = EMPTY
    return EMPTY
  }
  const raw = readRaw(PREFIX + user.id)
  if (user.id === snapUserId && raw === snapRaw) return snapIds

  let parsed = []
  try {
    parsed = raw ? JSON.parse(raw) : []
  } catch {
    parsed = []
  }
  // Ignore ids that are no longer in the course data.
  const ids = Array.isArray(parsed) ? [...new Set(parsed.filter((id) => typeof id === 'string' && getCourseById(id)))] : []
  snapUserId = user.id
  snapRaw = raw
  snapIds = ids.length ? ids : EMPTY
  return snapIds
}

export const isSaved = (courseId) => getSavedIds().includes(courseId)

const listeners = new Set()

function emit() {
  const ids = getSavedIds()
  for (const l of [...listeners]) {
    try {
      l(ids)
    } catch (err) {
      console.error(err)
    }
  }
}

export function toggleSaved(courseId) {
  const user = getCurrentUser()
  if (!user) throw new Error('Please log in to save courses')
  if (!getCourseById(courseId)) throw new Error('This course no longer exists.')
  const current = getSavedIds()
  const nowSaved = !current.includes(courseId)
  const next = nowSaved ? [...current, courseId] : current.filter((id) => id !== courseId)
  const s = storage()
  if (!s) throw new Error('Saving is not available in this browser.')
  try {
    s.setItem(PREFIX + user.id, JSON.stringify(next))
  } catch {
    throw new Error('Could not save this course in your browser.')
  }
  emit()
  return nowSaved
}

export function subscribeSaved(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Saved list changes whenever the logged-in user changes.
let lastUserId = getCurrentUser()?.id ?? null
subscribeAuth((user) => {
  const id = user?.id ?? null
  if (id === lastUserId) return
  lastUserId = id
  emit()
})

// Cross-tab sync.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (e) => {
    if (e.key === null || (e.key && e.key.startsWith(PREFIX))) emit()
  })
}
