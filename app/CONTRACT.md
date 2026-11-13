# Linkbery architecture contract: data layer and interface

Linkbery is a **course aggregator**. It lists online courses from many providers
(Coursera, Udemy, edX, Guvi, Simplilearn, YouTube, Unacademy...), lets students
search, filter, compare and save them, and links out to the provider to enrol.
It does not host any course content.

Stack: React 19 + Vite + react-router-dom v7, plain CSS. **No backend**: course
data is a local JSON file, and accounts/saved courses live in `localStorage`
(demo-only login; this must say so in the UI).

The old static site is in `../legacy/` and is for reference only: look and feel,
orange accent, sidebar layout, dark mode. Images we reuse are in `public/images/`.

---

## 1. Folder ownership (do NOT edit files you don't own)

| Owner | Paths |
|---|---|
| **Data & logic layer** | `src/data/**`, `src/lib/**`, `src/hooks/**`, `scripts/**`, `package.json` / lockfile (dependencies are added here), any `*.test.js` under `src/lib` |
| **Interface layer** | `src/components/**`, `src/pages/**`, `src/styles/**`, `src/App.jsx`, `src/main.jsx`, `index.html`, `public/**` |
| Shared | `CONTRACT.md`: change it deliberately, in its own commit |

The interface must import data **only** through the public functions in sections 3–5,
never read `courses.json` or `localStorage` directly.

## 2. Course schema (`src/data/courses.json` = array of these)

```js
{
  id: "google-data-analytics",        // unique kebab-case slug, stable, used in URLs
  title: "Google Data Analytics",
  provider: "Google",                 // who made the course (Google, IBM, Udemy instructor org...)
  platform: "Coursera",               // where it is hosted: Coursera | Udemy | edX | Guvi | Simplilearn | YouTube | Unacademy | ...
  url: "https://www.coursera.org/professional-certificates/google-data-analytics", // always absolute https
  description: "Short 1–2 sentence summary" | null,
  skills: ["Data Analysis", "SQL", ...],         // trimmed, de-duplicated, Title Case as in source
  categories: ["data-science", "business"],      // 1+ of CATEGORY slugs below
  level: "Beginner" | "Intermediate" | "Advanced" | "Mixed",
  type: "Professional Certificate" | "Specialization" | "Course" | "Guided Project" | "Video Series" | "Bootcamp",
  duration: "3 - 6 Months" | null,
  rating: 4.8 | null,                 // 0–5
  reviewCount: 140000 | null,         // integer; "140K reviews" -> 140000
  price: "Free" | "Paid" | "Free to audit" | null,
  image: "/images/ml_udemy.jpg" | null,   // null -> UI shows platform logo / placeholder
  source: "csv" | "legacy-site" | "sample" // where the record came from
}
```

### Categories (fixed list – `getCategories()` returns these)

```js
{ slug, name, group: "technical" | "non-technical", icon /* Font Awesome class, e.g. "fa-code" */ }
```
technical: development, coding, ui-ux, data-science, ai-ml, cybersecurity, cloud, math, software, science
non-technical: business, project-management, marketing, design, photography, music, film, fitness

### Platforms (`getPlatforms()`)

```js
{ name: "Coursera", slug: "coursera", logo: "/images/c.jpg" | null, url: "https://www.coursera.org" }
```
Known logos: Coursera `/images/c.jpg`, Udemy `/images/udemy.jpg`, edX `/images/edx.jpg`,
Guvi `/images/guvi.jpg`, Simplilearn `/images/sl.jpg`, Unacademy `/images/unacademy.jpg`.

## 3. `src/lib/courses.js` (all synchronous, pure)

```js
getAllCourses(): Course[]
getCourseById(id): Course | undefined
getCategories(): Category[]
getCategory(slug): Category | undefined
getPlatforms(): Platform[]
getAllSkills(): { name, count }[]           // sorted by count desc
searchCourses({
  query = "",            // free text: matches title, provider, platform, skills, description (case-insensitive, all words must match)
  categories = [],       // OR within the list
  skills = [],           // course must have ALL listed skills
  levels = [],           // OR
  platforms = [],        // OR, by platform name
  minRating = 0,         // courses with rating null are excluded when minRating > 0
  price = [],            // OR
  sort = "relevance"     // "relevance" | "rating" | "reviews" | "title"
} = {}): Course[]
getRelatedCourses(id, limit = 4): Course[]   // by shared skills/categories, excluding itself
getPlatformInsights(): {
  platform: Platform, courseCount, avgRating /* null if none */, totalReviews,
  levels: { Beginner: n, ... }, topSkills: { name, count }[] /* top 5 */, categories: { slug: n }
}[]                                          // sorted by courseCount desc
getOverallStats(): { courseCount, platformCount, skillCount, avgRating }
recommendCourses(goalText, { level, limit = 6 } = {}): {
  course: Course, score: number /* 0-1 */, matchedSkills: string[], reason: string
}[]   // keyword/skill matching + synonyms ("ml" -> "Machine Learning", "js" -> "JavaScript"), boosted by rating/reviews and level fit
```

## 4. `src/lib/auth.js` (demo auth in localStorage, async API so it can become Firebase later)

```js
// User object exposed to UI (never includes the password hash)
{ id, name, email, role: "Student", avatar: string | null /* data URL or /images/pic-1.jpg */, createdAt }

signUp({ name, email, password }): Promise<User>          // throws Error(message) on duplicate email / weak password (<6 chars)
logIn({ email, password }): Promise<User>                 // throws Error("Invalid email or password")
logOut(): Promise<void>
getCurrentUser(): User | null                              // sync
updateProfile({ name?, email?, avatar? }): Promise<User>
changePassword({ oldPassword, newPassword }): Promise<void>
subscribeAuth(listener: (user|null) => void): () => void   // returns unsubscribe
```
Passwords are hashed with SHA-256 (Web Crypto) + per-user salt. Error messages are user-friendly strings the UI can show as-is.

## 5. `src/lib/saved.js` (per logged-in user; guests get an empty list and toggle throws `Error("Please log in to save courses")`)

```js
getSavedIds(): string[]
isSaved(courseId): boolean
toggleSaved(courseId): boolean   // returns new saved state
subscribeSaved(listener: (ids) => void): () => void
```

## 6. Hooks (`src/hooks/`, data layer, built on useSyncExternalStore)

```js
useAuth(): { user, signUp, logIn, logOut, updateProfile, changePassword }
useSaved(): { savedIds, isSaved, toggleSaved }
```

## 7. Routes (interface layer)

| Path | Page |
|---|---|
| `/` | Home: hero, search, category quick-options (technical / non-technical / popular skills), featured courses, stats |
| `/courses` | All courses with filter sidebar (category, level, platform, rating, price, skill) + sort; filters in URL query string |
| `/courses/:id` | Course detail: all fields, "Go to course" (external, `target=_blank rel=noopener`), save button, related courses |
| `/category/:slug` | Courses in a category (reuses the courses list) |
| `/search?q=` | Search results (header search box submits here) |
| `/recommend` | "What do you want to learn?" → `recommendCourses` results with reasons |
| `/insights` | Platform insights computed by `getPlatformInsights` (cards + simple CSS bar charts) |
| `/login`, `/register` | Auth forms with validation + error display; show "demo login: data stays in this browser" note |
| `/profile` | User info, saved courses list, counts; redirect to /login if logged out |
| `/profile/edit` | Update name/email/avatar, change password |
| `/about`, `/contact` | Static content (no fake stats/testimonials; contact form shows a "thanks" message only) |
| `*` | 404 |

## 8. Stubs

`src/lib/*.js` and `src/hooks/*.js` currently contain **working stubs** with the
right signatures and 3 sample courses, so the interface could be built in parallel.
The data layer replaced their implementations; signatures must not change.

---

# Round 2 additions

Ownership in section 1 is unchanged. New lib/hook/data files belong to the data layer;
new pages/components/styles/public files belong to the interface layer.
`app/README.md`, `app/public/_redirects` and `app/vercel.json` belong to the **interface layer**.

> **Integration rule (round 1 bug):** the UI once passed `{ q }` to `searchCourses`,
> which expects `{ query }`, so search silently returned everything. Call every
> function with the **exact parameter names below**. Data layer: unknown option
> keys must not be silently ignored in development. Log `console.warn` for
> unknown keys in `searchCourses`, `getFacetCounts` and `recommendCourses` when
> `import.meta.env?.DEV` is true.

## 9. Additions to `src/lib/courses.js`

```js
LEVELS        // exported const: ["Beginner", "Intermediate", "Advanced", "Mixed"]
PRICES        // exported const: ["Free", "Free to audit", "Paid"]
getFacetCounts(filters): {           // filters = same object shape as searchCourses
  categories: { [slug]: n }, levels: { [level]: n }, platforms: { [name]: n }, price: { [price]: n }
}
// Standard faceted counts: the count for an option in facet F is the number of
// courses matching ALL current filters EXCEPT facet F's own selection, with that
// option applied. Every known option appears (0 allowed).
getCompareSummary(ids: string[]): {
  courses: Course[],                       // same order as ids, unknown ids dropped
  sharedSkills: string[],                  // skills present in every course (only if >= 2 courses)
  uniqueSkills: { [courseId]: string[] },  // skills only that course has
  best: { rating: id | null, reviews: id | null }  // null when no data or a tie for the top
}
```
`recommendCourses(goal, { level })`: `level` undefined, "" or "Any" means any level.
`getPlatforms()` logos: YouTube `/images/platforms/youtube.svg`,
Khan Academy `/images/platforms/khan-academy.svg`, fast.ai `/images/platforms/fastai.svg`
(the interface layer provides these simple SVG marks in `public/`).

## 10. Compare (`src/lib/compare.js`, `src/hooks/useCompare.js`)

Works for guests. localStorage key `linkbery.compare`. Max 3 courses.
```js
MAX_COMPARE   // 3
getCompareIds(): string[]          // stable reference between changes
addToCompare(id): void             // throws Error("You can compare up to 3 courses. Remove one first.") when full; no-op if present
removeFromCompare(id): void
clearCompare(): void
subscribeCompare(listener): () => void
useCompare(): { compareIds, isInCompare(id), addToCompare, removeFromCompare, clearCompare, max }
```
Route `/compare` shows the stored list; `/compare?ids=a,b,c` (shareable) shows those ids and offers "Use this list" to store them.

## 11. Learning paths (`src/data/paths.json`, `src/lib/paths.js`)

```js
// paths.json: 6–8 paths, each 4–6 steps, using ONLY existing course ids
{
  id: "data-analyst", title: "Become a Data Analyst",
  description: "One or two sentences.",
  goal: "Get job-ready for entry-level data analyst roles",
  level: "Beginner" | "Intermediate" | "Advanced",
  categories: ["data-science"],     // category slugs
  icon: "fa-chart-line",
  steps: [{ courseId, title: "Learn SQL basics", note: "Why this step, one sentence.", optional: false }]
}
getAllPaths(): Path[]
getPathById(id): Path | undefined
getPathsForCourse(courseId): Path[]
getPathProgress(pathId, progressMap): { completed, inProgress, total, percent }   // pure; optional steps excluded from total
```
Routes: `/paths` (list), `/paths/:id` (ordered steps with course cards + progress bar).

## 12. Progress tracking (`src/lib/progress.js`, `src/hooks/useProgress.js`)

Per logged-in user, key `linkbery.progress.<userId>`. Guests: empty map; `setStatus` throws `Error("Please log in to track your progress")`.
```js
STATUSES   // ["planning", "in-progress", "completed"]
getProgress(): { [courseId]: { status, updatedAt } }   // stable reference between changes
getStatus(courseId): status | null
setStatus(courseId, status | null): void                // null removes
subscribeProgress(listener): () => void
useProgress(): { progress, getStatus(id), setStatus }
```
UI: a status selector on the course detail page (and compact on cards), and a profile section with tabs Planning / In progress / Completed plus path progress.

## 13. Routes added
`/compare`, `/paths`, `/paths/:id`. Sidebar gains "Learning paths" and "Compare (n)".

---

# Round 3 additions

Eight new features: (A) job skill-gap finder with AI, (B) study planner with calendar
export, (C) public learning profile, (D) student reviews, (E) course notes,
(F) watchlist + price/free alerts, (G) admin page, (H) installable offline app (PWA).
English only. Still no database: everything except the AI call is stored in
`localStorage` on this device, and every page that stores data says so.

**Ownership changes this round.** The data layer also owns `api/**`, `server/**`,
`vite.config.js`, `vercel.json` and `.env.example`. The interface layer also owns
`public/manifest.webmanifest`, `public/sw.js` and `public/icons/**`.

Every new store follows the existing pattern (see `saved.js` / `progress.js`):
- all localStorage keys start with `linkbery.`
- stable snapshot references (for `useSyncExternalStore`)
- `subscribeX(listener) => unsubscribe`
- cross-tab `storage` sync
- per-user keys re-read when the logged-in user changes
- guests get empty data, and writes throw `Error("Please log in to ...")` with a friendly message

The integration rule still applies: use the **exact parameter names**, and log dev warnings for unknown option keys.

## 14. Skill-gap finder (`src/lib/skillGap.js`, `src/hooks/useSkillGap.js`, `server/skillGap.js`, `api/skill-gap.js`)

The AI runs on an Ollama server (model `llama3.1:8b`). The browser never sees its URL or key.

**Server** (`server/skillGap.js`: plain ESM, no dependencies, Node 20 `fetch`):
```js
handleSkillGap(body, env, fetchImpl = fetch): Promise<{ status: number, json: object }>
// body: { text: string }   text trimmed, 30–6000 chars, else 400 { error }
// env:  { OLLAMA_URL, OLLAMA_MODEL = "llama3.1:8b", OLLAMA_API_KEY? }   OLLAMA_URL missing -> 503 { error }
// Calls POST `${OLLAMA_URL}/api/chat` { model, stream:false, format:"json", options:{temperature:0}, messages }
//   with Authorization: Bearer <OLLAMA_API_KEY> only when set; 25 s timeout (AbortController).
// Validates the model output. Success -> 200 { role: string|null, skills: [{ name, importance: "required"|"nice" }] }
//   (max 40 skills, names trimmed to <= 60 chars, de-duplicated case-insensitively)
// Ollama error / timeout / unparseable output -> 502 { error: "The AI service did not respond." }
```
- `api/skill-gap.js`: a Vercel Node function (POST only, 405 otherwise) that wraps `handleSkillGap(req.body, process.env)`. It sets `export const config = { maxDuration: 30 }`.
- `vite.config.js`: a dev-only middleware serves `POST /api/skill-gap` through the same handler, with env from `loadEnv(mode, process.cwd(), '')`, so `.env.local` works locally.
- `vercel.json`: the SPA rewrite must exclude `/api/`.
- `.env.example` documents the three variables.

**Client** (`src/lib/skillGap.js`):
```js
matchSkill(name): string | null
// Maps any skill name to a Linkbery skill from getAllSkills(). Case- and punctuation-insensitive,
// plus a synonym table (js -> JavaScript, ml -> Machine Learning, "python (pandas)" -> Python, ...). null if none.
extractSkillsBasic(text): { role: string|null, skills: [{ name, importance }] }   // local keyword matching, no network
analyzeJob(text, { haveSkills = [], signal, timeoutMs = 20000 } = {}): Promise<SkillGapResult>
// Throws Error("Paste at least a few sentences of the job description.") under 30 chars,
// and Error("That job description is too long (max 6000 characters).") over 6000.
// Tries POST /api/skill-gap. On a network error, non-200 response or timeout, falls back to extractSkillsBasic.
SkillGapResult = {
  source: "ai" | "basic",
  notice: string | null,      // "The AI service is unavailable right now, so this uses basic skill matching." after a fallback
  role: string | null,
  skills: [{ name, importance: "required"|"nice", matched: string|null, have: boolean }],
  have: string[],             // matched skills the user already has
  missing: string[],          // matched skills the user lacks, required first
  unmatched: string[],        // job skills that no Linkbery course covers
  courses: [{ course: Course, covers: string[] }]   // up to 6: greedy cover of `missing` (required weighted x2), ties broken by rating
}
getUserSkills(progressMap): string[]   // skills from completed courses (pure)
useSkillGap(): { analyze(text, { haveSkills }), result, loading, error, reset }   // aborts the in-flight request on a new call or unmount
```
Route `/skill-gap`: a textarea plus optional "Skills I already have" chips. Results are grouped into Have, Missing and Not covered, followed by a course list and an AI/basic badge.

## 15. Study planner (`src/lib/planner.js`, `src/hooks/usePlans.js`)

```js
estimateHours(course): { hours: number, basis: string }
// From duration: "Less Than 2 Hours" -> 2, "N Hours" -> N, "1 - 4 Weeks" -> 25, "1 - 3 Months" -> 85,
//   "3 - 6 Months" -> 190 (providers assume about 10 h/week).
// No duration -> by type: Guided Project 2, Video Series 6, Course 20, Specialization 85,
//   Professional Certificate 190, Bootcamp 300.
// basis is a plain sentence, e.g. "Estimated from “1 - 3 Months” at about 10 hours a week".
buildSchedule({ pathId, hoursPerWeek, startDate, includeOptional = false, skipCompleted = true,
                progressMap = {}, hoursOverride = {} }): Schedule      // pure
// hoursPerWeek is an integer 1–60 (throws otherwise). startDate is "YYYY-MM-DD" (local date). An unknown path throws.
// Courses are scheduled in step order, back to back, filling each week to hoursPerWeek. A course can span weeks.
Schedule = {
  pathId, hoursPerWeek, startDate, endDate,          // endDate = last study day "YYYY-MM-DD"
  totalHours, weekCount,
  items: [{ courseId, title /* step title */, hours, estimated: boolean, startDate, endDate, weekStart, weekEnd }],
  weeks: [{ index /* 1-based */, start, end, hours, items: [{ courseId, hours }] }],
  skipped: [courseId]                                  // completed (when skipCompleted) or optional (when excluded)
}
buildIcs(schedule, { pathTitle }): string
// RFC 5545 with CRLF lines: one all-day VEVENT per item (DTEND exclusive),
// SUMMARY "Study: <course title>", DESCRIPTION with the hours and the course URL, and a stable UID.
icsFileName(pathId): string                           // "linkbery-<pathId>-plan.ics"
// Saved plans per user, key linkbery.plans.<userId>:
getPlans(): { [pathId]: PlanSettings }                // stable reference
getPlan(pathId): PlanSettings | null
savePlan(pathId, { hoursPerWeek, startDate, includeOptional, hoursOverride }): PlanSettings   // adds updatedAt
deletePlan(pathId): void
subscribePlans(listener)
usePlans(): { plans, getPlan, savePlan, deletePlan }
```
Route `/paths/:id/plan` works for guests as a preview; saving needs a login. The path detail page gets a "Plan my schedule" button.

## 16. Public profile (`src/lib/publicProfile.js`, `src/hooks/usePublicProfile.js`)

There is no server, so a public profile is a **self-contained link**: its data is encoded in the URL.
```js
getPublicSettings(): { headline: string, bio: string, show: { completed, inProgress, paths, skills, reviews } }
// all show flags default to true
savePublicSettings(partial): settings      // headline <= 80 chars, bio <= 300 chars; key linkbery.public.<userId>
buildPublicProfile(): ProfilePayload
// Built from the current user, progress, paths and reviews, following the show flags. Throws when logged out.
ProfilePayload = { v: 1, name, headline, bio, memberSince /* YYYY-MM */, completed: [courseId], inProgress: [courseId],
                   paths: [{ id, percent }], skills: [string] /* top 12 from completed */, reviews: [{ courseId, rating, title }] }
encodeProfile(payload): string              // base64url of UTF-8 JSON; compact keys allowed
decodeProfile(str): ProfilePayload | null
// Never throws. Validates types, caps lengths and drops unknown course/path ids.
getPublicProfileUrl(): string               // "/u/<name-slug>?p=<encoded>" (relative; the UI prefixes the origin)
subscribePublicSettings(listener)
usePublicProfile(): { settings, saveSettings, profileUrl }   // profileUrl is recomputed when progress or settings change
```
Routes:
- `/u/:slug` is public. It reads `?p=` and shows "This profile link is incomplete" when decoding fails. The slug is only for looks.
- `/profile/share` is protected: settings, a preview and a copy-link button.

Avatars are not included in the link; the profile shows initials.

## 17. Reviews (`src/lib/reviews.js`, `src/hooks/useReviews.js`)

A device-wide store, `linkbery.reviews`, shared by all users on this browser. No invented or seed reviews.
```js
Review = { id, courseId, userId, userName, rating /* int 1–5 */, title /* <= 100 */, body /* 10–2000 */, createdAt, updatedAt, helpful: [userId] }
getReviews(courseId, { sort = "newest" } = {}): Review[]
// sort: newest | helpful | highest | lowest. Stable reference per (course, sort, data).
getReviewSummary(courseId): { count, average /* 1 decimal */ | null, distribution: { 1..5: n } }
getMyReview(courseId): Review | null
saveReview(courseId, { rating, title, body }): Review       // one per user per course (upsert); throws friendly validation errors
deleteReview(reviewId): void                                 // own reviews only
toggleHelpful(reviewId): boolean                             // throws on your own review
getReviewsByUser(userId?): Review[]                          // defaults to the current user
subscribeReviews(listener)
useReviews(courseId, { sort }): { reviews, summary, myReview, saveReview, deleteReview, toggleHelpful }
```
UI:
- The course page gets a "Student reviews on Linkbery" section: summary, distribution bars, form and list. It stays separate from the provider rating and notes that reviews are stored in this browser.
- The profile gets a "Reviews" tab.

## 18. Notes (`src/lib/notes.js`, `src/hooks/useNotes.js`)

Per user, key `linkbery.notes.<userId>`.
```js
getAllNotes(): { [courseId]: { text, updatedAt } }   // stable
getNote(courseId): { text, updatedAt } | null
setNote(courseId, text): void                       // trimmed; "" deletes; max 5000 chars (throws)
subscribeNotes(listener)
useNotes(): { notes, getNote, setNote }
```
UI:
- A "My notes" card on the course page. It saves automatically once typing stops, shows a "Saved" indicator, and shows URLs as links in view mode.
- A "Notes" tab on the profile.

## 19. Watchlist and alerts (`src/lib/watch.js`, `src/hooks/useWatch.js`, `src/hooks/useNotifications.js`)

Per user:
- `linkbery.watch.<userId>` = `{ [courseId]: { price, watchedAt } }` (a price snapshot)
- `linkbery.notifications.<userId>` = Notification[] (newest first, max 50)

```js
getWatchedIds(): string[]          // stable
isWatched(courseId): boolean
toggleWatch(courseId): boolean     // stores the current price as the snapshot
checkWatchedCourses(): Notification[]
// Compares snapshots with the current course data, creates notifications for changes, updates the snapshots
// and returns the new notifications. Runs automatically on module load and whenever the user logs in.
Notification = { id, type: "now-free" | "price-change" | "course-removed", courseId, courseTitle, from, to, createdAt, read }
// now-free: the price changed to "Free" or "Free to audit" from something else.
getNotifications(): Notification[]  // stable
getUnreadCount(): number
markRead(id), markAllRead(), clearNotifications()
subscribeWatch(listener), subscribeNotifications(listener)
useWatch(): { watchedIds, isWatched, toggleWatch }
useNotifications(): { notifications, unreadCount, markRead, markAllRead, clearNotifications }
```
Course data changes when `npm run data` rebuilds it or when an admin edits a course (section 20). So editing a watched course's price in the admin page and reloading produces an alert; that is the demo loop.

UI:
- a "Watch price" toggle on the course page
- a bell with the unread count in the header (logged in only), with a dropdown of the latest 5
- `/notifications` (protected)
- a "Watching" tab on the profile

## 20. Admin (`src/lib/admin.js`, `src/hooks/useAdmin.js`; overrides applied in `courses.js` and `paths.js`)

This is a demo admin: any logged-in user can open `/admin`, and the page says that a real site would restrict it to staff.

Edits are stored as overrides in `linkbery.admin.overrides` =
`{ courses: { upsert: { [id]: Course }, removed: [id] }, paths: { upsert: { [id]: Path }, removed: [id] } }`.
- `courses.js` and `paths.js` apply the overrides **once at module load**, so derived data stays consistent. Changes therefore take effect after a page reload.
- Corrupt overrides are ignored and must never crash the app.
- To avoid a circular import, keep the raw override read in a dependency-free module (e.g. `src/lib/overrides.js`).
```js
validateCourse(course): { [field]: message }   // {} when valid; same rules as scripts/build-courses.mjs
validatePath(path): { [field]: message }
getAdminCourses(): [{ course, status: "original" | "edited" | "added" | "removed" }]   // includes removed ones
getAdminPaths():   [{ path,   status: ... }]
saveCourse(course): void        // throws Error with the first validation message; a new id must be unique kebab-case
removeCourse(id), restoreCourse(id)
// restore drops the override: edited or removed goes back to the original; an added course is deleted.
savePath(path), removePath(id), restorePath(id)
resetOverrides(): void
getOverrideCount(): number
needsReload(): boolean          // true after any change since this page load
exportCoursesJson(): string     // the merged course list, pretty-printed, ready to replace src/data/courses.json
exportPathsJson(): string
importOverrides(jsonString): void   // throws Error on invalid JSON or shape
subscribeAdmin(listener)
useAdmin(): { courses, paths, saveCourse, removeCourse, restoreCourse, savePath, removePath, restorePath,
              resetOverrides, overrideCount, needsReload, exportCoursesJson, exportPathsJson, importOverrides }
```
Routes (protected): `/admin` (tabs Courses, Paths and Data), `/admin/courses/new`, `/admin/courses/:id`,
`/admin/paths/new` and `/admin/paths/:id`. A "Reload to apply changes" banner shows while `needsReload` is true.

## 21. Installable offline app (interface layer)

- `public/manifest.webmanifest`:
  - name, short_name "Linkbery", start_url "/", display "standalone"
  - theme and background colours from the tokens
  - icons `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-maskable-512.png`
- `public/sw.js`, with versioned caches:
  - network-first for navigations, falling back to the cached `/index.html`
  - cache-first for `/assets/*`
  - stale-while-revalidate for `/images/*`, `/icons/*` and Google Fonts
  - **never** caches `/api/*` or non-GET requests
  - registered from `main.jsx` only when `import.meta.env.PROD`
- UI:
  - an "Install app" action (beforeinstallprompt) in the user menu or footer
  - an offline banner: "You're offline. Saved pages still work; AI skill matching falls back to basic."
  - an "Update available - Reload" toast when a new service worker is waiting

Course data is bundled with the app, so browsing works offline.

## 22. Routes added in round 3

`*` means login required:
- `/skill-gap`
- `/paths/:id/plan`
- `/u/:slug`
- `/profile/share`*
- `/notifications`*
- `/admin`*, `/admin/courses/new`*, `/admin/courses/:id`*, `/admin/paths/new`*, `/admin/paths/:id`*

Other changes:
- The profile gains the tabs Reviews, Notes, Plans and Watching.
- The header gets a bell (logged in only) and a "Skill gap" link in the nav or the Explore menu.
- The command palette lists the new pages.
