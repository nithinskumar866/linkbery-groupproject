import CourseListView from '../components/CourseListView.jsx'
import { usePageTitle } from '../components/utils.js'

export default function Courses() {
  usePageTitle('All courses')
  return (
    <CourseListView
      title="All courses"
      subtitle="Courses from every platform we list. Filter by category, level, platform, rating and price, then compare."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Courses' }]}
    />
  )
}
