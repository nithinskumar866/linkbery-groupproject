// Single place for icons. Everything is lucide-react, 16px, stroke 1.75
// (the defaults come from <LucideProvider> in main.jsx).
// Pages import icons from here instead of from lucide-react directly.
import { createElement, isValidElement } from 'react'
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Calculator,
  CalendarClock,
  Camera,
  ChartColumn,
  ChartLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CirclePlay,
  Clapperboard,
  Clock,
  Cloud,
  CodeXml,
  Compass,
  Copy,
  CornerDownLeft,
  Dumbbell,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  GitCompareArrows,
  GraduationCap,
  Hash,
  Headset,
  House,
  Info,
  LayoutGrid,
  Lightbulb,
  List,
  ListFilter,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Moon,
  Music,
  Palette,
  PenTool,
  Plus,
  Route,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  SquareKanban,
  SquareTerminal,
  Star,
  Sun,
  Target,
  Trash2,
  TriangleAlert,
  Trophy,
  User,
  UserPen,
  UserPlus,
  Users,
  WandSparkles,
  X,
} from 'lucide-react'

export {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Calculator,
  CalendarClock,
  Camera,
  ChartColumn,
  ChartLine,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CirclePlay,
  Clapperboard,
  Clock,
  Cloud,
  CodeXml,
  Compass,
  Copy,
  CornerDownLeft,
  Dumbbell,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  GitCompareArrows,
  GraduationCap,
  Hash,
  Headset,
  House,
  Info,
  LayoutGrid,
  Lightbulb,
  List,
  ListFilter,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Moon,
  Music,
  Palette,
  PenTool,
  Plus,
  Route,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  SquareKanban,
  SquareTerminal,
  Star,
  Sun,
  Target,
  Trash2,
  TriangleAlert,
  Trophy,
  User,
  UserPen,
  UserPlus,
  Users,
  WandSparkles,
  X,
}

export const ICON_SIZE = 16
export const ICON_STROKE = 1.75

/** Category slug (CONTRACT "Categories") -> Lucide icon. getCategories().icon is ignored. */
export const CATEGORY_ICONS = {
  development: CodeXml,
  coding: SquareTerminal,
  'ui-ux': PenTool,
  'data-science': ChartLine,
  'ai-ml': BrainCircuit,
  cybersecurity: ShieldCheck,
  cloud: Cloud,
  math: Sigma,
  software: AppWindow,
  science: FlaskConical,
  business: BriefcaseBusiness,
  'project-management': SquareKanban,
  marketing: Megaphone,
  design: Palette,
  photography: Camera,
  music: Music,
  film: Clapperboard,
  fitness: Dumbbell,
}

export function categoryIcon(slug) {
  return CATEGORY_ICONS[slug] || Hash
}

/** <CategoryIcon slug="data-science" size={16} /> */
export function CategoryIcon({ slug, size = ICON_SIZE, ...rest }) {
  return createElement(categoryIcon(slug), { size, strokeWidth: ICON_STROKE, 'aria-hidden': true, ...rest })
}

/** Icon for a learning path: the icon of its first category. */
export function PathIcon({ path, size = ICON_SIZE, ...rest }) {
  return createElement(CategoryIcon, { slug: path?.categories?.[0], size, ...rest })
}

/**
 * Resolve an icon given as a Lucide component or an already rendered element. Returns a renderable node or null.
 */
export function renderIcon(icon, props = {}) {
  if (!icon) return null
  if (isValidElement(icon)) return icon
  // Strings (old icon class names) are not supported: render nothing.
  if (typeof icon === 'string') return null
  return createElement(icon, { size: ICON_SIZE, strokeWidth: ICON_STROKE, 'aria-hidden': true, ...props })
}

/** <Icon icon={Search} size={16} /> with the app defaults applied. */
export function Icon({ icon, size = ICON_SIZE, ...rest }) {
  return renderIcon(icon, { size, ...rest })
}
