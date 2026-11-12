import { useParams } from 'react-router-dom'
import { getCategory } from '../lib/courses.js'
import CourseListView from '../components/CourseListView.jsx'
import { usePageTitle } from '../components/utils.js'
import { categoryDesc } from './categoryCopy.js'
import NotFound from './NotFound.jsx'

export default function Category() {
  const { slug } = useParams()
  const category = getCategory(slug)
  usePageTitle(category ? `${category.name} courses` : 'Category not found')

  if (!category) {
    return <NotFound title="Category not found" message={`There is no category called “${slug}”.`} />
  }

  return (
    <CourseListView
      key={category.slug}
      title={`${category.name} courses`}
      fixedCategory={category.slug}
      subtitle={categoryDesc(category)}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Courses', to: '/courses' }, { label: category.name }]}
    />
  )
}
