# Linkbery design spec

**Direction:** a dark, precise product UI in the family of Linear, Raycast and
Vercel. It is a tool for finding courses quickly, not a marketing page. Every
pixel should look intentional. When unsure, remove decoration rather than add it.

Tokens live in `src/styles/tokens.css`. **Use only those variables**: no new
hex colours, font sizes or radii in component or page CSS.

## Non-negotiables (the "anti-template" rules)

1. **No gradients, glows, blurred blobs, glassmorphism or emoji** anywhere.
2. **No drop shadows on cards or sections.** Depth comes from `--surface`
   vs `--bg` and 1px `--border`. Only floating layers (menus, the command palette,
   toasts, the compare tray) use `--shadow-pop`.
3. **Radius ≤ `--radius-lg` (10px).** No pill buttons and no pill chips. Chips/tags use
   `--radius-sm`.
4. **One accent colour** (`--accent`, berry). Use it for the primary action on a
   screen, active nav, focus rings, selected states and key data. Never as a large
   background fill. Status colours are only for status.
5. **Typography carries the hierarchy, not colour or boxes.** Use Geist for UI
   and Geist Mono for numbers, counts, ratings, durations, kbd hints, ids and
   section labels. Headings use `--tracking-tight` and weight 600. Never 800/900.
6. **Icons:** `lucide-react` only, 16px (`size={16}`), `strokeWidth={1.75}`, coloured
   `--text-3` unless active. **Font Awesome is removed**: no `fa-*` classes
   anywhere, and the CDN link is gone. Category icons map slug → Lucide
   component in a single helper (`src/components/icons.js`).
7. **Density:** 14px body, 32px control height (`.btn`, inputs), 8px base gaps. Lists
   beat card grids. Show more information per screen with less chrome.
8. **Copy:** sentence case everywhere, short and specific. No "Unlock your potential",
   no exclamation marks, no marketing filler. Numbers are real (from `getOverallStats`).
9. **Motion:** only opacity/transform/background transitions at `--dur` /
   `--dur-fast` with `--ease`. Respect `prefers-reduced-motion`.
10. **Both themes** must work: dark is the default, light via the toggle
    (`<html data-theme>`, localStorage `linkbery.theme`, default `dark` when unset).

## App shell

- **Top bar** (`--topbar-h`, sticky, `--bg` with bottom `--border`): logo wordmark
  "linkbery" (lowercase, weight 600, small berry square mark before it), primary
  nav (Courses, Paths, Recommend, Insights), then on the right: a search trigger
  showing `Search courses…  Ctrl K`, a theme toggle icon button, the compare
  indicator (`Compare 2`, only when there are items) and the user menu (avatar
  initials, 24px) or `Log in`.
- **No persistent left sidebar.** Under 768px the nav collapses into a menu button
  that opens a full-height sheet.
- **Command palette (Ctrl/Cmd+K and `/`):** a centred modal (max 640px) with an input
  and a keyboard-navigable result list. It searches courses with `searchCourses({ query })`
  (top 8) plus pages and paths, using ↑↓ Enter Esc. This is the main way to search.
- Content is centred at `--content-max` with `--space-6` side padding (`--space-4`
  on mobile). Footer: one muted line with a few links.

## Core primitives (class names both layers use)

| Class | Use |
|---|---|
| `.btn` `.btn-primary` `.btn-ghost` `.btn-danger` `.btn-sm` `.btn-icon` | 32px buttons (28px for `-sm`). Primary = accent fill + `--on-accent` text. Default = `--surface` + border. Ghost = transparent. |
| `.input` `.select` `.textarea` `.field` `.field-label` `.field-hint` `.field-error` | Form controls: 32px, `--bg-subtle` fill, border, accent focus ring |
| `.tag` | Small skill/meta label: mono 12px, `--radius-sm`, border, no fill |
| `.badge` `.badge-green` `.badge-amber` `.badge-red` `.badge-blue` `.badge-accent` | Status: a subtle fill and coloured text |
| `.kbd` | Keyboard hint: mono 11px, border, `--radius-sm` |
| `.panel` | `--surface` box with border and `--radius-lg`; padding `--space-5` |
| `.section-label` | Mono 12px uppercase `--tracking-label` `--text-3`, e.g. "COURSES · 84" |
| `.page-head` `.page-title` `.page-desc` | Page header: 28px title and a 14px `--text-2` description, left aligned |
| `.divider` | 1px `--border` rule |
| `.meter` `.meter-fill` | A 4px progress/score bar, accent fill |
| `.empty` | Empty state: centred icon (24px, `--text-3`), title and a one-line hint |
| `.skeleton` | Optional loading shimmer (opacity pulse only) |

## Course display

- **CourseRow** (default in lists: courses, search, category, profile): a single
  dense row with
  - platform logo 20px
  - title (`--text`, 14px, weight 500) with `provider · platform` muted below
  - level · type · duration in mono `--text-3`
  - rating `4.8` + `140K` in mono (a dash when null)
  - price badge
  - action icons (save, compare, status), shown on hover/focus on desktop and always on touch

  Rows are separated by `--border`, use a `--surface-hover` background on hover, and the whole row is a link.
- **CourseCard** (compact tile for the home page, related courses and path steps):
  `.panel` with a smaller padding, platform + title + 2 tags + a rating line. No images,
  no big thumbnails.
- **Ratings:** no star icons. Show the number in mono with a small `★` glyph in
  `--amber` before it.

## Page notes

- **Home:**
  - Left-aligned hero: a 44px heading of max 2 lines, e.g. "Every good course, one search away.", a muted line, a large search field that opens the palette, and a row of real stats in mono (`84 courses · 9 platforms · 221 skills`).
  - Then "Browse by category" as a tight list/grid of text links with Lucide icons and counts, "Learning paths" (3 rows), and "Top rated" (5 CourseRows).
- **Courses / category / search:** the filters are a left column (`--filters-w`) of
  collapsible groups with checkbox rows and mono counts; on mobile they open as a
  sheet. The toolbar has the result count, active filter tags (removable) and a sort select.
- **Course detail:** two columns: main content (title, meta line, description, skills
  as tags, "Part of these paths"), and a sticky side `.panel` with the primary
  `Go to course ↗` button, save/compare/status controls and the facts list (mono values).
- **Compare:** a real table with sticky attribute column, row hover and mono values;
  the best value gets an accent marker and shared skills a green tag.
- **Paths:** a list with progress meters; the path detail is a vertical numbered timeline
  (mono step numbers, a 1px line, a status dot per step).
- **Insights:** CSS bar charts as thin bars with mono labels; no chart library and no colour per platform.
- **Recommend:** the input with example prompts as `.tag` buttons; results as CourseRows
  with a score `.meter` and the reason in muted text.
- **Auth:** a narrow centred `.panel` (max 380px), the "demo login" note as a quiet
  `.badge-amber` line, no illustrations.
- **About/Contact:** plain text pages with a narrow column, no stock SVG illustrations
  (stop using `about-img.svg`/`contact-img.svg`).
- **Profile:** a header row (avatar, name, email, member since), then tabs (Saved ·
  Planning · In progress · Completed · Paths) with mono counts.

## Component API the pages rely on (built by the shell/components side)

Existing components keep their current names and props working (CourseCard,
CourseGrid, PageHeader, EmptyState, FilterPanel, CourseListView, SaveButton,
CompareButton, ProgressStatus, PathCard, CourseMini, MyLearning, RatingStars,
PlatformLogo, Avatar, PasswordInput, DemoNotice, ProtectedRoute, Toaster/toast),
restyled to this spec. New ones:

```jsx
<CourseRow course={course} extra={node} />   // dense row; `extra` renders under the meta line (e.g. score meter + reason)
<CourseList courses={list} variant="rows" | "cards" empty={node} />   // rows by default
import { CategoryIcon, Icon } from '../components/icons.js'
<CategoryIcon slug="data-science" size={16} />   // Lucide icon for a category slug
// icons.js also re-exports the Lucide icons used across the app, so pages import icons from one place
<CommandPalette />                             // mounted once in Layout; open with openPalette() from components/palette.js
import { openPalette } from '../components/palette.js'
```

## Accessibility

Keep everything the current UI does: labels, focus-visible rings (2px
`--border-focus`, offset 2px), aria on menus/tabs/dialogs, palette focus trap,
and 4.5:1 contrast for body text in both themes.
