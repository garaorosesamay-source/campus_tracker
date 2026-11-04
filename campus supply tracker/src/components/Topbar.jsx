import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'
import { useInventory } from '../context/InventoryContext.jsx'

function Topbar() {
  const { admin, logout, isSuperadmin } = useAdmin()
  const { lowStockItems } = useInventory()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar border-bottom px-3 px-md-4 py-3">
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-outline-success d-md-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-label="Open menu"
        >
          <i className="bi bi-list"></i>
        </button>
        <span className="d-none d-sm-inline">Welcome, {admin.name}</span>
        <span
          className={`badge ${
            isSuperadmin
              ? 'bg-success text-white'
              : 'bg-secondary-subtle text-secondary-emphasis border'
          } rounded-pill px-2 py-1 small`}
        >
          {isSuperadmin ? (
            <>
              <i className="bi bi-shield-shaded me-1"></i> Superadmin
            </>
          ) : (
            <>
              <i className="bi bi-person-check me-1"></i> Admin
            </>
          )}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {isSuperadmin && (
          <Link to="/superadmin" className="btn btn-sm btn-outline-success d-none d-md-inline-flex align-items-center gap-1">
            <i className="bi bi-shield-shaded"></i> Console
          </Link>
        )}

        {lowStockItems.length > 0 && (
          <Link to="/inventory" className="text-decoration-none">
            <span className="badge text-bg-danger-subtle text-danger-emphasis rounded-pill d-flex align-items-center gap-1 px-3 py-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {lowStockItems.length} low stock
            </span>
          </Link>
        )}

        <Link to="/profile" className="text-decoration-none" title="Admin Profile">
          <div
            className="avatar-circle"
            style={admin.image ? { backgroundImage: `url(${admin.image})` } : undefined}
          >
            {!admin.image && <i className="bi bi-person-fill text-body-secondary"></i>}
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
          title="Log Out"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span className="d-none d-lg-inline">Log Out</span>
        </button>
      </div>
    </nav>
  )
}

export default Topbar
