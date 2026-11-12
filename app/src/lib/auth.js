// Demo authentication backed by localStorage (CONTRACT.md section 4).
// DEMO ONLY: accounts live in this browser. Passwords are salted + SHA-256
// hashed so they are not stored in plain text, but this is not real security.
// The API is async so it can later be swapped for a real backend (e.g. Firebase).

const USERS_KEY = 'linkbery.users'
const SESSION_KEY = 'linkbery.session'
const MIN_PASSWORD = 6
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// ---------------------------------------------------------------------------
// Storage (guarded so the module can be imported in Node / tests)
// ---------------------------------------------------------------------------
function storage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage
  } catch {
    // Access can throw (e.g. disabled cookies / sandboxed iframes).
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

function writeRaw(key, value) {
  const s = storage()
  if (!s) throw new Error('Saving is not available in this browser.')
  try {
    if (value == null) s.removeItem(key)
    else s.setItem(key, value)
  } catch (err) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      throw new Error('Not enough browser storage. Try a smaller profile picture.')
    }
    throw new Error('Could not save your data in this browser.')
  }
}

function parseJson(raw, fallback) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) ?? fallback
  } catch {
    return fallback
  }
}

const readUsers = () => {
  const users = parseJson(readRaw(USERS_KEY), [])
  return Array.isArray(users) ? users : []
}
const writeUsers = (users) => writeRaw(USERS_KEY, JSON.stringify(users))
const readSessionId = () => parseJson(readRaw(SESSION_KEY), null)?.userId ?? null
const writeSession = (userId) => writeRaw(SESSION_KEY, userId ? JSON.stringify({ userId }) : null)

// ---------------------------------------------------------------------------
// Crypto helpers
// ---------------------------------------------------------------------------
function cryptoApi() {
  const c = globalThis.crypto
  if (!c?.subtle || !c.getRandomValues) throw new Error('Secure login is not supported in this browser.')
  return c
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

function randomHex(bytes) {
  const arr = new Uint8Array(bytes)
  cryptoApi().getRandomValues(arr)
  return toHex(arr)
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  return toHex(await cryptoApi().subtle.digest('SHA-256', data))
}

function newId() {
  const c = globalThis.crypto
  return typeof c?.randomUUID === 'function' ? c.randomUUID() : `u-${Date.now().toString(36)}-${randomHex(6)}`
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase()

function checkEmail(email) {
  if (!email) throw new Error('Please enter your email address.')
  if (!EMAIL_RE.test(email)) throw new Error('Please enter a valid email address.')
}

function checkName(name) {
  if (!name) throw new Error('Please enter your name.')
  if (name.length > 80) throw new Error('Name must be 80 characters or fewer.')
}

function checkPassword(password, label = 'Password') {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
    throw new Error(`${label} must be at least ${MIN_PASSWORD} characters.`)
  }
}

// Public view of a stored user: never includes hash or salt.
const toPublic = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role ?? 'Student',
  avatar: u.avatar ?? null,
  createdAt: u.createdAt,
})

// ---------------------------------------------------------------------------
// Snapshot cache: getCurrentUser() returns the same object until the stored
// data actually changes (required by useSyncExternalStore).
// ---------------------------------------------------------------------------
let snapUsersRaw
let snapSessionRaw
let snapUser = null

export function getCurrentUser() {
  const usersRaw = readRaw(USERS_KEY)
  const sessionRaw = readRaw(SESSION_KEY)
  if (usersRaw === snapUsersRaw && sessionRaw === snapSessionRaw) return snapUser

  snapUsersRaw = usersRaw
  snapSessionRaw = sessionRaw
  const id = parseJson(sessionRaw, null)?.userId ?? null
  const stored = id ? readUsers().find((u) => u.id === id) : null
  const next = stored ? toPublic(stored) : null
  // Keep the old reference if nothing visible changed (e.g. another user's record was edited).
  if (!(next && snapUser && JSON.stringify(next) === JSON.stringify(snapUser))) snapUser = next
  return snapUser
}

const listeners = new Set()

function emit() {
  const user = getCurrentUser()
  for (const l of [...listeners]) {
    try {
      l(user)
    } catch (err) {
      console.error(err)
    }
  }
}

export function subscribeAuth(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Cross-tab sync.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === USERS_KEY || e.key === SESSION_KEY) emit()
  })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function signUp({ name, email, password } = {}) {
  const cleanName = String(name ?? '').trim()
  const cleanEmail = normalizeEmail(email)
  checkName(cleanName)
  checkEmail(cleanEmail)
  checkPassword(password)

  const users = readUsers()
  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error('An account with this email already exists. Try logging in instead.')
  }
  const salt = randomHex(16)
  const user = {
    id: newId(),
    name: cleanName,
    email: cleanEmail,
    role: 'Student',
    avatar: null,
    createdAt: new Date().toISOString(),
    salt,
    hash: await hashPassword(password, salt),
  }
  writeUsers([...readUsers(), user])
  writeSession(user.id)
  emit()
  return getCurrentUser()
}

export async function logIn({ email, password } = {}) {
  const cleanEmail = normalizeEmail(email)
  if (!cleanEmail || !password) throw new Error('Please enter your email and password.')
  const user = readUsers().find((u) => u.email === cleanEmail)
  // Hash even when the user is unknown so both failures take similar time.
  const hash = await hashPassword(String(password), user?.salt ?? 'no-user')
  if (!user || hash !== user.hash) throw new Error('Invalid email or password')
  writeSession(user.id)
  emit()
  return getCurrentUser()
}

export async function logOut() {
  try {
    writeSession(null)
  } catch {
    // Nothing stored to clear.
  }
  emit()
}

function requireStoredUser(users) {
  const id = readSessionId()
  const index = id ? users.findIndex((u) => u.id === id) : -1
  if (index < 0) throw new Error('Please log in first.')
  return index
}

export async function updateProfile({ name, email, avatar } = {}) {
  const users = readUsers()
  const index = requireStoredUser(users)
  const current = users[index]
  const next = { ...current }

  if (name !== undefined) {
    const cleanName = String(name ?? '').trim()
    checkName(cleanName)
    next.name = cleanName
  }
  if (email !== undefined) {
    const cleanEmail = normalizeEmail(email)
    checkEmail(cleanEmail)
    if (cleanEmail !== current.email && users.some((u) => u.email === cleanEmail && u.id !== current.id)) {
      throw new Error('Another account already uses this email.')
    }
    next.email = cleanEmail
  }
  if (avatar !== undefined) {
    if (avatar !== null && typeof avatar !== 'string') throw new Error('Invalid profile picture.')
    next.avatar = avatar || null
  }

  users[index] = next
  writeUsers(users)
  emit()
  return getCurrentUser()
}

export async function changePassword({ oldPassword, newPassword } = {}) {
  const users = readUsers()
  const index = requireStoredUser(users)
  const user = users[index]
  if (!oldPassword) throw new Error('Please enter your current password.')
  if ((await hashPassword(String(oldPassword), user.salt)) !== user.hash) {
    throw new Error('Your current password is incorrect.')
  }
  checkPassword(newPassword, 'New password')
  const salt = randomHex(16)
  users[index] = { ...user, salt, hash: await hashPassword(newPassword, salt) }
  writeUsers(users)
  emit()
}
