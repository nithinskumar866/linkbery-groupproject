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
      title={q ? `Results for “${q}”` : 'Search courses'}
      subtitle="Matches course titles, providers, platforms, skills and descriptions."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Courses', to: '/courses' }, { label: 'Search' }]}
    />
  )
}
