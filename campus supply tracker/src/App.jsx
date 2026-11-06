import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { InventoryProvider } from './context/InventoryContext'
import { AdminProvider } from './context/AdminContext'

import RequireAuth from './components/RequireAuth'

import Login from './pages/Login'
import Signup from './pages/Signup'

import Inventory from './pages/Inventory'
import AddItem from './pages/AddItem'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

import SuperadminDashboard from './pages/SuperadminDashboard'

function App() {
  return (
    <AdminProvider>
      <InventoryProvider>
        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/inventory"
            element={
              <RequireAuth>
                <Inventory />
              </RequireAuth>
            }
          />

          <Route
            path="/add"
            element={
              <RequireAuth>
                <AddItem />
              </RequireAuth>
            }
          />

          <Route
            path="/reports"
            element={
              <RequireAuth>
                <Reports />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          <Route
            path="/superadmin"
            element={
              <RequireAuth requiredRole="Superadmin">
                <SuperadminDashboard />
              </RequireAuth>
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </InventoryProvider>
    </AdminProvider>
  )
}

export default App