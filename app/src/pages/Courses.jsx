import CourseListView from '../components/CourseListView.jsx'
import { usePageTitle } from '../components/utils.js'

export default function Courses() {
  usePageTitle('All courses')
  return (
    <CourseListView
      title="Courses"
      subtitle="Filter by category, level, platform, rating and price. Filters are kept in the URL, so you can share any view."
    />
  )
}
