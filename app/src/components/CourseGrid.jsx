import CourseList from './CourseList.jsx'

/** Grid of CourseCards. Kept for existing callers; same as <CourseList variant="grid" />. */
export default function CourseGrid({ courses, empty, label = 'Courses', className }) {
  return <CourseList courses={courses} empty={empty} label={label} variant="grid" className={className} />
}
