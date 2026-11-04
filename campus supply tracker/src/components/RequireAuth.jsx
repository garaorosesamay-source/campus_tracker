import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'


function RequireAuth({ children, requiredRole }) {
  const { isLoggedIn, currentUser } = useAdmin()

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/inventory" replace />
  }

  return children
}

export default RequireAuth
