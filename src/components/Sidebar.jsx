import { Link, useLocation } from 'react-router-dom'
import { Offcanvas } from 'bootstrap'
import { useAdmin } from '../context/AdminContext.jsx'

const baseLinks = [
  { path: '/inventory', icon: 'bi-box-seam-fill', label: 'Inventory' },
  { path: '/add', icon: 'bi-plus-square-fill', label: 'Add Item' },
  { path: '/reports', icon: 'bi-table', label: 'Reports' },
  { path: '/profile', icon: 'bi-person-badge-fill', label: 'Profile' },
]

function SidebarNav({ onNavigate }) {
  const location = useLocation()
  const { isSuperadmin } = useAdmin()

  const links = isSuperadmin
    ? [...baseLinks, { path: '/superadmin', icon: 'bi-shield-shaded', label: 'Superadmin Console' }]
    : baseLinks

  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-4 px-1">
        <span className="brand-icon">
          <i className="bi bi-pencil-fill text-success"></i>
        </span>
        <span className="fw-bold">School Supplies</span>
      </div>

      <nav className="nav nav-pills flex-column gap-1 mb-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={onNavigate}
            className={`nav-link d-flex align-items-center gap-2 ${
              location.pathname === link.path ? 'active' : 'text-body-secondary'
            }`}
          >
            <i className={`bi ${link.icon}`}></i>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="card bg-body-tertiary border-0 mt-auto">
        <div className="card-body d-flex gap-2">
          <i className="bi bi-building text-success fs-5"></i>
          <div>
            <div className="fw-bold small">Supply Room</div>
            <div className="text-body-secondary small">Manage school supplies easily.</div>
          </div>
        </div>
      </div>
    </>
  )
}

function Sidebar() {
  return (
    <>
      <aside className="app-sidebar d-none d-md-flex flex-column p-3">
        <SidebarNav />
      </aside>

      <div className="offcanvas offcanvas-start" tabIndex="-1" id="sidebarOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <SidebarNav
            onNavigate={() => {
              const el = document.getElementById('sidebarOffcanvas')
              Offcanvas.getOrCreateInstance(el).hide()
            }}
          />
        </div>
      </div>
    </>
  )
}

export default Sidebar
