import CourseListView from '../components/CourseListView.jsx'
import { usePageTitle } from '../components/utils.js'

export default function Courses() {
  usePageTitle('All courses')
  return (
    <CourseListView
      title="All courses"
      icon="fa-graduation-cap"
      subtitle="Filter by category, level, platform, rating, price and skill. The filters are saved in the address bar, so you can share the link."
    />
  )
}
