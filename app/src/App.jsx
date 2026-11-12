import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import About from './pages/About.jsx'
import Category from './pages/Category.jsx'
import Compare from './pages/Compare.jsx'
import Contact from './pages/Contact.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import Courses from './pages/Courses.jsx'
import EditProfile from './pages/EditProfile.jsx'
import Home from './pages/Home.jsx'
import Insights from './pages/Insights.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import PathDetail from './pages/PathDetail.jsx'
import Paths from './pages/Paths.jsx'
import Profile from './pages/Profile.jsx'
import Recommend from './pages/Recommend.jsx'
import Register from './pages/Register.jsx'
import Search from './pages/Search.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="category/:slug" element={<Category />} />
        <Route path="search" element={<Search />} />
        <Route path="compare" element={<Compare />} />
        <Route path="paths" element={<Paths />} />
        <Route path="paths/:id" element={<PathDetail />} />
        <Route path="recommend" element={<Recommend />} />
        <Route path="insights" element={<Insights />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute message="Please log in to see your profile and saved courses.">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/edit"
          element={
            <ProtectedRoute message="Please log in to edit your profile.">
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
