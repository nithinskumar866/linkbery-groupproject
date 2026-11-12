# Linkbery design spec (v3: professional site)

**Direction:** a professional online-learning website in the family of large,
established course platforms: white pages, navy ink, one berry brand colour,
real course thumbnails, a proper header with search and "Join for free", grey
section bands and a full footer. It should feel like a real company's product,
trustworthy and calm. Not playful, not a dev tool, not a template.

**Reference screens:** the home page, the courses listing and the course page are the
canonical examples of this style. New pages should reuse their header band, card, list
result and side-card patterns rather than inventing new ones.

Tokens live in `src/styles/tokens.css`. **Use only those variables.** Light is
the default theme; dark is optional via the header toggle (`linkbery.theme`).

## Rules

1. **Type:** Plus Jakarta Sans everywhere (400–800). Headings weight 800 with
   `--tracking-tight`; body 15px / 1.55. Use `font-variant-numeric: tabular-nums` for counts.
2. **Colour:** text `--text`, secondary `--text-2`, meta `--text-3`. The brand colour is only for
   primary buttons, links in body copy, active states and small highlights. Navy (`--navy`)
   is used for the course-page hero, the stats band and the footer.
3. **Shape:** buttons and inputs `--radius` (8px), cards `--radius-lg` (12px), big panels `--radius-xl`.
   **Pills** (`--radius-pill`) only for the header search, topic tabs, filter chips and badges.
4. **Depth:** cards have a 1px `--border`, `--shadow-sm` at rest and `--shadow-md` on hover. The
   course-page side card uses `--shadow-lg`. No gradients, glows or emoji.
5. **Icons:** `lucide-react` (already installed), 18px in the UI, stroke 2.
6. **Copy:** sentence case, plain and specific. Real numbers only (from the lib).
7. **Layout:** content max `--content-max` (1280px) with `--gutter` side padding (16px on phones).
   Sections are separated by `--bg-soft` bands with top/bottom `--border`, 56–72px vertical padding.
8. **Responsive:** everything works at 360px with no horizontal page scroll; the header collapses to
   logo + search icon + menu button; filters become a slide-over sheet.
9. **Accessibility:** real buttons/links/labels, visible focus ring (2px `--brand`, offset 2px),
   aria on menus/tabs/dialogs, 4.5:1 text contrast in both themes.

## App shell

- **Header** (white, bottom border, `--header-h`): logo (berry rounded square mark with two
  white circles + "Linkbery" 800 weight), **Explore** button opening a categories menu (two
  columns: Technical / Non-technical with counts, plus "All courses" and "Learning paths"),
  a pill search field (submits to `/search?q=`; Ctrl/Cmd+K or `/` opens the command palette),
  nav links (Learning paths, Compare (n), Insights), then **Log in** (brand text) and
  **Join for free** (brand button), or the user menu (avatar + name) when logged in.
  A small theme toggle icon button sits before Log in.
- **Footer** (navy): brand blurb + three link columns (Explore, Categories, Linkbery) and a bottom
  line "© 2026 Linkbery · Course details come from each provider and may change."
- **Page header band** (for inner pages): `--bg-soft` band with breadcrumb, 36px title and a
  one-line description, like the Listing mockup.
- **Command palette:** keep the existing behaviour, restyled light (white panel, `--shadow-lg`).
- **Compare tray:** white bar fixed at the bottom with a top border and `--shadow-lg`, course
  chips, "Clear" and a brand "Compare now" button.
- **Toasts:** white card, `--shadow-lg`, coloured left icon (no coloured borders).

## Course display

- **Thumbnails:** use `course.image` when present (`/images/...`). Otherwise a solid tile using
  `--tile-1..6` (pick by the course's first category, stable), showing the platform in small
  uppercase and the title in 800 weight, exactly like the mockups. One shared `CourseThumb` component.
- **CourseCard** (grid): thumbnail 16:9 on top, then provider · platform (13px, `--text-3`),
  title (16px 700), rating line (`★ 4.8` in `--star` + review count, or "No rating yet"),
  meta (type · level), and a footer row with price and "+ Compare". Save is a bookmark icon
  button over the thumbnail's top-right corner.
- **CourseResult** (list): the wide horizontal card from the Listing mockup: thumbnail 220px left,
  details middle (provider, title, description, rating + meta, skill tags), and a right column with
  price, "View course" (brand) and "+ Compare". Default view on courses/category/search pages.
- **Price badge:** Free = green tint, Free to audit = blue tint, Paid = neutral text.

## Pages

- **Home:** as the mockup: grey hero band (54px heading, description, search with category select
  and popular searches, a 2×2 grid of thumbnail cards), platforms strip, **Popular courses** with
  topic tabs (working: they filter by category) and 8 cards, three "why Linkbery" points, learning
  paths (4 cards listing their first 3 steps), navy stats band, sign-up CTA box (hidden when logged in;
  show "Continue learning" with path progress instead), footer.
- **Courses / Category / Search:** page header band, left filter column (checkbox groups with counts,
  "Show more", "Clear all"), toolbar (result count "Showing 1–12 of 84", active filter chips, sort
  select, list/grid toggle), results, and **pagination** (12 per page, kept in the URL as `page`).
- **Course detail:** navy hero band (breadcrumb, "Provider · offered on Platform", 44px title,
  description, rating/level/type/duration), then two columns: main (skills, course details `<dl>`,
  learning path steps with "You are here", similar courses) and the side card (thumbnail, price,
  "Go to course on {Platform} ↗", Save, + Compare, progress select, note "You enrol and pay on …").
- **Compare:** page header band; a clean table with sticky first column, thumbnails in the header
  cells, "Best" badges, shared skills highlighted green; share link and "Use this list".
- **Learning paths:** band + grid of path cards (like the home cards, with progress bar when logged in).
  **Path detail:** band with goal, level, step count and progress; numbered vertical steps, each with
  a CourseResult-style compact card and a status select.
- **Recommend:** band with a large goal input + level select + example chips; results as CourseResults
  with a match bar and the reason.
- **Insights:** band; stat tiles; horizontal bar charts (courses per platform, average rating) and a
  platform table.
- **Login / Register:** centred card (max 440px) on `--bg-soft`, logo on top, the demo note as an
  amber-tint notice. **Profile:** header card (avatar, name, email, member since, Edit profile, Log out)
  and tabs (Saved · Planning · In progress · Completed · Paths) with counts.
  **Edit profile:** card form with avatar upload and change password.
- **About / Contact / 404:** band + readable text column; contact form in a card.

## Component API (keep working)

Keep existing names and props, restyled: CourseCard, CourseGrid, CourseList, CourseRow (may become
the list result), CourseListView, FilterPanel, PageHeader, EmptyState, SaveButton, CompareButton,
CompareTray, ProgressStatus/StatusControl, PathCard, CourseMini, MyLearning, RatingStars, PriceBadge,
PlatformLogo, Avatar, PasswordInput, DemoNotice, ProtectedRoute, Toaster/toast, CommandPalette/palette,
icons.js (CategoryIcon, PathIcon). New: `CourseThumb({ course, size })`, `Pagination({ page, pageCount, onChange })`,
`PageBand({ crumbs, title, desc, children })`, `ExploreMenu`.
