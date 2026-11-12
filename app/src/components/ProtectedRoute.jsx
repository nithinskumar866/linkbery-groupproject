import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

/** Renders children for logged-in users, otherwise redirects to /login and comes back afterwards. */
export default function ProtectedRoute({ children, message = 'Please log in to continue.' }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location, message }} />
  }
  return children
}
