import { useSearchParams } from 'react-router-dom'
import CourseListView from '../components/CourseListView.jsx'
import { usePageTitle } from '../components/utils.js'

export default function Search() {
  const [sp] = useSearchParams()
  const q = (sp.get('q') || '').trim()
  usePageTitle(q ? `Search: ${q}` : 'Search')
  return (
    <CourseListView
      searchMode
      title={q ? 'Search results' : 'Search'}
      subtitle={q ? undefined : 'Matches titles, providers, platforms, skills and descriptions.'}
    />
  )
}
