# Linkbery

Linkbery is a **course aggregator**. It lists online courses from many platforms
(Coursera, Udemy, edX, Guvi, Simplilearn, YouTube, Khan Academy, Unacademy and
more) in one place, so students can search, filter, compare and save them and
then enrol directly with the provider. Linkbery does not host any course
content; every "Go to course" button links out to the provider.

## Features

- **Browse and search** every course, with filters for category, level,
  platform, rating, price and skills. Each filter option shows how many courses
  match, and filters live in the URL so a filtered view can be shared.
- **Course pages** with provider, platform, level, duration, price, rating,
  skills, related courses, and the learning paths that include the course.
- **Compare** up to 3 courses side by side (skills in common, skills unique to
  each course, best rating and most reviews). A comparison can be shared with a
  `/compare?ids=a,b,c` link.
- **Learning paths**: step-by-step routes through courses from different
  platforms towards a goal, such as "Become a Data Analyst".
- **Progress tracking**: mark courses as Planning, In progress or Completed.
  Your profile groups courses by status and shows how far along each path you are.
- **Recommendations**: describe what you want to learn and get matching courses,
  each with the reason it was picked.
- **Platform insights**: course counts, average ratings, levels and top skills
  per platform.
- **Accounts**: register, log in, save courses, and edit your profile (name, email,
  photo, password).
- Light and dark theme, collapsible sidebar, works on phones down to 360px wide.

> **Demo login: data stays in this browser.** Linkbery has no server. Accounts,
> hashed passwords, saved courses and progress are stored in your browser's
> `localStorage`, on this device only. Don't reuse a real password. The compare
> list works without an account.

## Getting started

Requires Node.js 20+.

```bash
cd app
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm test         # run the unit tests (Vitest)
npm run lint     # lint (oxlint)
npm run build    # production build into dist/
npm run data     # rebuild src/data/courses.json from the sources (see below)
```

## Adding content

### Add a course

Course data is generated into `src/data/courses.json` by
`scripts/build-courses.mjs` from three sources: `../linkbery.csv` (a Coursera
export), the legacy courses listed in the script, and `scripts/sample-courses.json`.

1. Add the course to one of those sources. The simplest is to add a hand-written
   entry to the script's legacy list or to `scripts/sample-courses.json`, using the
   course schema in [`CONTRACT.md`](./CONTRACT.md) §2 (`id` is a unique kebab-case slug,
   `url` must be absolute https, `categories` must use the fixed category slugs).
2. Run `npm run data`. The script validates every record and rewrites `courses.json`.
3. Optional: put a banner image in `public/images/` and set `image` to `/images/<file>`.

### Add a learning path

Add an object to `src/data/paths.json` (schema in `CONTRACT.md` §11):

```json
{
  "id": "frontend-developer",
  "title": "Become a Front-end Developer",
  "description": "One or two sentences.",
  "goal": "Build and ship responsive websites",
  "level": "Beginner",
  "categories": ["development"],
  "icon": "fa-code",
  "steps": [
    { "courseId": "an-existing-course-id", "title": "Learn HTML and CSS", "note": "Why this step.", "optional": false }
  ]
}
```

Steps must use existing course ids. Optional steps don't count towards progress.
`icon` is any Font Awesome solid icon class.

## Project structure

```
app/
├── CONTRACT.md            shared API contract between the data and UI layers
├── index.html
├── public/                static files: images, platform logos, _redirects (Netlify)
├── vercel.json            SPA rewrite for Vercel
├── scripts/               data build script and sample data
└── src/
    ├── data/              courses.json, paths.json (generated / hand-written data)
    ├── lib/               pure data + storage logic: courses, auth, saved, compare, paths, progress
    ├── hooks/             React hooks over lib/ (useAuth, useSaved, useCompare, useProgress)
    ├── components/        reusable UI (CourseCard, FilterPanel, CompareTray, PathCard, ...)
    ├── pages/             one component per route
    ├── styles/            layout, components, pages, features CSS
    ├── App.jsx            routes
    └── main.jsx           entry point
```

The UI only reads data through the functions in `src/lib` (documented in
`CONTRACT.md`) and never touches `courses.json` or `localStorage` directly.

## Deploying

`npm run build` produces a static site in `dist/`. Because it is a single-page
app, the host must serve `index.html` for every route so deep links like
`/paths/data-analyst` work. This is already configured:

- **Vercel**: `vercel.json` rewrites all routes to `/index.html`.
- **Netlify**: `public/_redirects` (`/* /index.html 200`) is copied into `dist/`.

## Architecture

The app has two layers with a fixed interface between them, documented in
[`CONTRACT.md`](./CONTRACT.md):

- **Data and logic** (`src/data`, `src/lib`, `src/hooks`, `scripts`): course data,
  search, recommendations, demo auth, saved courses, compare, paths and progress.
- **Interface** (`src/components`, `src/pages`, `src/styles`): everything the user
  sees. It reads data only through the functions in `src/lib` and the hooks.

The original static site is kept in `../legacy/` for reference.
