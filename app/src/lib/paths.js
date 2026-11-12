// Learning paths (CONTRACT.md section 11). Data lives in src/data/paths.json and
// is validated by `npm run data` (scripts/build-courses.mjs) and paths.test.js.
import rawPaths from '../data/paths.json'
import { getCourseById } from './courses.js'

// Defensive: drop steps whose course no longer exists so the UI never gets an
// undefined course. Validation makes this a no-op for the shipped data.
const paths = rawPaths.map((p) => ({ ...p, steps: p.steps.filter((s) => getCourseById(s.courseId)) }))
const byId = new Map(paths.map((p) => [p.id, p]))

export const getAllPaths = () => paths
export const getPathById = (id) => byId.get(id)
export const getPathsForCourse = (courseId) => paths.filter((p) => p.steps.some((s) => s.courseId === courseId))

/**
 * Pure: counts only required (non-optional) steps. progressMap is the shape
 * returned by getProgress(): { [courseId]: { status, updatedAt } }.
 */
export function getPathProgress(pathId, progressMap = {}) {
  const path = byId.get(pathId)
  const steps = path ? path.steps.filter((s) => !s.optional) : []
  const map = progressMap && typeof progressMap === 'object' ? progressMap : {}
  const statusOf = (s) => map[s.courseId]?.status
  const completed = steps.filter((s) => statusOf(s) === 'completed').length
  const inProgress = steps.filter((s) => statusOf(s) === 'in-progress').length
  const total = steps.length
  return { completed, inProgress, total, percent: total ? Math.round((completed / total) * 100) : 0 }
}
