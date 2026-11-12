import { useCallback, useSyncExternalStore } from 'react'
import * as compare from '../lib/compare.js'

// compareIds is a stable array reference between changes (see lib/compare.js),
// so useSyncExternalStore does not loop. Works for guests.
export function useCompare() {
  const compareIds = useSyncExternalStore(compare.subscribeCompare, compare.getCompareIds, compare.getCompareIds)
  const isInCompare = useCallback((id) => compareIds.includes(id), [compareIds])
  return {
    compareIds,
    isInCompare,
    addToCompare: compare.addToCompare,
    removeFromCompare: compare.removeFromCompare,
    clearCompare: compare.clearCompare,
    max: compare.MAX_COMPARE,
  }
}
