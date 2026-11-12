// Small UI helpers shared by components and pages (no data access here
// except through src/lib/courses.js).
import { useEffect } from 'react'
import { getPlatforms, getCategory } from '../lib/courses.js'

/** Sets document.title to "<title> | Linkbery". */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Linkbery` : 'Linkbery - find the right course'
  }, [title])
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const full = new Intl.NumberFormat('en')

/** 140000 -> "140K"; null -> "" */
export function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return ''
  return Number(n) >= 10000 ? compact.format(n) : full.format(n)
}

export function formatNumber(n) {
  if (n == null || Number.isNaN(Number(n))) return '-'
  return full.format(n)
}

export function formatRating(r) {
  if (r == null || Number.isNaN(Number(r))) return null
  return Number(r).toFixed(1)
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** "Harvard University" -> "HU", "edX" -> "ED" */
export function initials(name) {
  if (!name) return '?'
  const words = String(name).trim().split(/[\s@._-]+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** Stable hue for a string, used for initials placeholders. */
export function hueFor(text) {
  let h = 0
  for (const ch of String(text || '')) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

/** Platform record for a platform name (case-insensitive), or a minimal fallback. */
export function findPlatform(name) {
  if (!name) return null
  const lower = String(name).toLowerCase()
  const found = getPlatforms().find((p) => p.name.toLowerCase() === lower || p.slug === lower)
  return found || { name, slug: lower.replace(/[^a-z0-9]+/g, '-'), logo: null, url: null }
}

export function categoryName(slug) {
  return getCategory(slug)?.name || slug
}

// Single source of truth for these lists is the lib (CONTRACT §9).
export { LEVELS, PRICES } from '../lib/courses.js'
export const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'title', label: 'Title (A-Z)' },
]
export const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5]

/** Path to return to after login, never back to the auth pages. */
export function returnPath(state, fallback = '/profile') {
  const from = state?.from
  if (!from) return fallback
  const path = typeof from === 'string' ? from : `${from.pathname || ''}${from.search || ''}${from.hash || ''}`
  if (!path || path.startsWith('/login') || path.startsWith('/register')) return fallback
  return path
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** "Google · Coursera", or just "Udemy" when provider and platform are the same. */
export function courseByline(course) {
  const by = [course?.provider, course?.platform].filter(Boolean)
  return by.length === 2 && by[0] === by[1] ? by[0] : by.join(' · ')
}
