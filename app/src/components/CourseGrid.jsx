import CourseList from './CourseList.jsx'

/** Grid of compact CourseCards. Kept for existing callers; prefer <CourseList />. */
export default function CourseGrid({ courses, empty, label = 'Courses' }) {
  return <CourseList courses={courses} empty={empty} label={label} variant="cards" />
}
