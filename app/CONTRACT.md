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
