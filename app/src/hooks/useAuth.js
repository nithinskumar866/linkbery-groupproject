import { useSyncExternalStore } from 'react'
import * as auth from '../lib/auth.js'

// user is a stable object reference between changes (see lib/auth.js).
export function useAuth() {
  const user = useSyncExternalStore(auth.subscribeAuth, auth.getCurrentUser, auth.getCurrentUser)
  return {
    user,
    signUp: auth.signUp,
    logIn: auth.logIn,
    logOut: auth.logOut,
    updateProfile: auth.updateProfile,
    changePassword: auth.changePassword,
  }
}
