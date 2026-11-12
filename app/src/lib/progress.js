// Progress tracking per logged-in user (CONTRACT.md section 12).
// Key: linkbery.progress.<userId>. Guests get an empty map and cannot set a status.
import { getCurrentUser, subscribeAuth } from './auth.js'
import { getCourseById } from './courses.js'

export const STATUSES = Object.freeze(['planning', 'in-progress', 'completed'])
const PREFIX = 'linkbery.progress.'
const EMPTY = Object.freeze({})

function storage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage
  } catch {
    // Access can throw (e.g. blocked storage); treat as unavailable.
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

function parse(raw) {
  let parsed
  try {
    parsed = raw ? JSON.parse(raw) : {}
  } catch {
    parsed = {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const out = {}
  for (const [courseId, entry] of Object.entries(parsed)) {
    // Ignore unknown courses and malformed or unknown statuses.
    if (!getCourseById(courseId) || !entry || !STATUSES.includes(entry.status)) continue
    out[courseId] = { status: entry.status, updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : null }
  }
  return out
}

// Snapshot cache so getProgress() returns a stable object between changes.
let snapUserId = null
let snapRaw
let snapMap = EMPTY

export function getProgress() {
  const user = getCurrentUser()
  if (!user) {
    snapUserId = null
    snapRaw = undefined
    snapMap = EMPTY
    return EMPTY
  }
  const raw = readRaw(PREFIX + user.id)
  if (user.id === snapUserId && raw === snapRaw) return snapMap
  const map = parse(raw)
  snapUserId = user.id
  snapRaw = raw
  snapMap = Object.keys(map).length ? map : EMPTY
  return snapMap
}

export const getStatus = (courseId) => getProgress()[courseId]?.status ?? null

const listeners = new Set()

function emit() {
  const map = getProgress()
  for (const l of [...listeners]) {
    try {
      l(map)
    } catch (err) {
      console.error(err)
    }
  }
}

export function setStatus(courseId, status) {
  const user = getCurrentUser()
  if (!user) throw new Error('Please log in to track your progress')
  if (status !== null && status !== undefined && !STATUSES.includes(status)) {
    throw new Error(`Unknown status "${status}". Use one of: ${STATUSES.join(', ')}.`)
  }
  if (!getCourseById(courseId)) throw new Error('This course no longer exists.')

  const current = getProgress()
  const next = { ...current }
  if (status) {
    if (current[courseId]?.status === status) return
    next[courseId] = { status, updatedAt: new Date().toISOString() }
  } else {
    if (!(courseId in current)) return
    delete next[courseId]
  }

  const s = storage()
  if (!s) throw new Error('Progress tracking is not available in this browser.')
  try {
    s.setItem(PREFIX + user.id, JSON.stringify(next))
  } catch {
    throw new Error('Could not save your progress in this browser.')
  }
  emit()
}

export function subscribeProgress(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Switch to the right user's map when the logged-in user changes.
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
