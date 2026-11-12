import { useCallback, useSyncExternalStore } from 'react'
import * as saved from '../lib/saved.js'

// savedIds is a stable array reference between changes (see lib/saved.js).
export function useSaved() {
  const savedIds = useSyncExternalStore(saved.subscribeSaved, saved.getSavedIds, saved.getSavedIds)
  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds])
  return { savedIds, isSaved, toggleSaved: saved.toggleSaved }
}
