// Compare list (CONTRACT.md section 10). Works for guests; stored in
// localStorage under "linkbery.compare". Max 3 courses.
import { getCourseById } from './courses.js'

export const MAX_COMPARE = 3
const KEY = 'linkbery.compare'
const EMPTY = Object.freeze([])

function storage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage
  } catch {
    // Access can throw (e.g. blocked storage); treat as unavailable.
  }
  return null
}

function readRaw() {
  try {
    return storage()?.getItem(KEY) ?? null
  } catch {
    return null
  }
}

// In-memory fallback so the feature still works for the session when storage
// is unavailable or full.
let memoryRaw = null

// Snapshot cache: getCompareIds() returns the same array until the stored value changes.
let snapRaw
let snapIds = EMPTY

function parse(raw) {
  let parsed
  try {
    parsed = raw ? JSON.parse(raw) : []
  } catch {
    parsed = []
  }
  if (!Array.isArray(parsed)) return []
  // Ignore unknown ids (e.g. a course removed from the data) and duplicates.
  return [...new Set(parsed.filter((id) => typeof id === 'string' && getCourseById(id)))].slice(0, MAX_COMPARE)
}

export function getCompareIds() {
  const raw = storage() ? readRaw() : memoryRaw
  if (raw === snapRaw) return snapIds
  const ids = parse(raw)
  snapRaw = raw
  snapIds = ids.length ? ids : EMPTY
  return snapIds
}

const listeners = new Set()

function emit() {
  const ids = getCompareIds()
  for (const l of [...listeners]) {
    try {
      l(ids)
    } catch (err) {
      console.error(err)
    }
  }
}

function write(ids) {
  const raw = JSON.stringify(ids)
  const s = storage()
  if (s) {
    try {
      s.setItem(KEY, raw)
    } catch {
      throw new Error('Could not update the compare list in your browser.')
    }
  } else memoryRaw = raw
  emit()
}

export function addToCompare(id) {
  const current = getCompareIds()
  if (current.includes(id)) return
  if (!getCourseById(id)) throw new Error('This course no longer exists.')
  if (current.length >= MAX_COMPARE) throw new Error('You can compare up to 3 courses. Remove one first.')
  write([...current, id])
}

export function removeFromCompare(id) {
  const current = getCompareIds()
  if (!current.includes(id)) return
  write(current.filter((x) => x !== id))
}

export function clearCompare() {
  if (!getCompareIds().length) return
  write([])
}

export function subscribeCompare(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Cross-tab sync: another tab changed (or cleared) localStorage.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === KEY) emit()
  })
}
