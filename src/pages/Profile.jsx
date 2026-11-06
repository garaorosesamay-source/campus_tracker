import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'

function Profile() {
  const { admin, updateAdmin, logout } = useAdmin()
  const [name, setName] = useState(admin.name)
  const [email, setEmail] = useState(admin.email)
  const [saved, setSaved] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  function handleAvatarClick() {
    fileInputRef.current.click()
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFileError('Please choose an image file.')
      return
    }

    setFileError('')
    const reader = new FileReader()
    reader.onload = () => updateAdmin({ image: reader.result })
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    updateAdmin({ name, email })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="container-fluid bg-success-subtle p-3 p-md-4">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-success-subtle text-success-emphasis border px-2 py-1">
              <i className="bi bi-person-badge me-1"></i> Account Settings
            </span>
            <span className="badge bg-secondary-subtle text-secondary border">
              Role: {admin.role || 'Admin'}
            </span>
          </div>
          <h1 className="fs-2 fw-bold mb-1">Admin Profile</h1>
          <p className="text-body-secondary mb-4">Manage your admin account information.</p>

          <div className="row">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="card">
                <div className="card-body p-4">
                  {saved && (
                    <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Profile updated successfully!</span>
                    </div>
                  )}

                  {fileError && (
                    <div className="alert alert-danger py-2 small mb-3">{fileError}</div>
                  )}

                  <div className="text-center mb-4">
                    <div
                      className="avatar-circle-lg mx-auto d-flex align-items-center justify-content-center rounded-circle"
                      onClick={handleAvatarClick}
                      title="Click to change profile picture"
                    >
                      {admin.image ? (
                        <img
                          src={admin.image}
                          alt="Avatar"
                          className="rounded-circle w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <i className="bi bi-person-fill text-success" style={{ fontSize: '2.5rem' }}></i>
                      )}
                      <span className="avatar-camera-badge">
                        <i className="bi bi-camera-fill"></i>
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="d-none"
                    />
                    <div className="small text-muted mt-2">Click icon to upload photo</div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label small">Admin Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2">
                      <i className="bi bi-save-fill"></i> Save Changes
                    </button>
                  </form>

                  <button
                    className="btn btn-outline-danger w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
