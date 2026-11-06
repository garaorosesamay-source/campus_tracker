

import { useEffect, useMemo, useState } from 'react';
import { auth } from '../firebase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\\/$/, '');
const API_URL = `${API_BASE_URL}/api/admins`;

async function authenticatedFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in again to manage administrators.');
  const token = await user.getIdToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function SuperAdminDashboard({ onLogout }) {

  const [admins, setAdmins] = useState([]);

  const [name, setName] = useState('');

  const [lastName, setLastName] = useState('');

  const [editID, setEditID] = useState(null);

  const [editName, setEditName] = useState('');

  const [editLastName, setEditLastName] = useState('');

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteID, setDeleteID] = useState(null);

  const [activePage, setActivePage] = useState('dashboard');
  async function fetchAdmins() {

    setLoading(true);

    setError('');

    try {

      const response = await authenticatedFetch(API_URL);

      if (!response.ok) {

        throw new Error('Unable to load the admins list.');

      }

      const data = await response.json();

      setAdmins(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error('Error loading admins:', err);

      setError(

        'Unable to reach the API. Check the Render service URL and deployment status.'

      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    fetchAdmins();

  }, []);

  const filteredAdmins = useMemo(() => {

    const keyword = search.trim().toLowerCase();

    return admins.filter((admin) => {

      const fullName = `${admin.name} ${admin.lastName}`.toLowerCase();

      return fullName.includes(keyword);

    });

  }, [admins, search]);

  function showSuccess(message) {

    setSuccess(message);

    setError('');

  }
  async function handleAdd(event) {

    event.preventDefault();

    setError('');

    setSuccess('');

    const cleanName = name.trim();

    const cleanLastName = lastName.trim();

    if (!cleanName || !cleanLastName) {

      setError('Please enter both first name and last name.');

      return;

    }

    setSaving(true);

    try {

      const response = await authenticatedFetch(API_URL, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          name: cleanName,

          lastName: cleanLastName,

        }),

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || 'Unable to add the admin.');

      }

      setAdmins((previous) => [...previous, data]);

      setName('');

      setLastName('');

      showSuccess('Admin added successfully.');

    } catch (err) {

      console.error('Error adding admin:', err);

      setError(err.message || 'Cannot connect to the server.');

    } finally {

      setSaving(false);

    }

  }
  function openEdit(admin) {

    setEditID(admin.id);

    setEditName(admin.name);

    setEditLastName(admin.lastName);

    setError('');

    setSuccess('');

    setIsModalOpen(true);

  }
  async function handleUpdate(event) {

    event.preventDefault();

    setError('');

    setSuccess('');

    const cleanName = editName.trim();

    const cleanLastName = editLastName.trim();

    if (!cleanName || !cleanLastName) {

      setError('Please enter both first name and last name.');

      return;

    }

    setSaving(true);

    try {

      const response = await authenticatedFetch(`${API_URL}/${editID}`, {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          name: cleanName,

          lastName: cleanLastName,

        }),

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || 'Unable to update the admin.');

      }

      setAdmins((previous) =>

        previous.map((admin) =>

          String(admin.id) === String(editID) ? data : admin

        )

      );

      setIsModalOpen(false);

      setEditID(null);

      showSuccess('Admin updated successfully.');

    } catch (err) {

      console.error('Error updating admin:', err);

      setError(err.message || 'Cannot connect to the server.');

    } finally {

      setSaving(false);

    }

  }
  async function handleDelete() {

    if (deleteID === null) return;

    setError('');

    setSuccess('');

    setSaving(true);

    try {

      const response = await authenticatedFetch(`${API_URL}/${deleteID}`, {

        method: 'DELETE',

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || 'Unable to delete the admin.');

      }

      setAdmins((previous) =>

        previous.filter(

          (admin) => String(admin.id) !== String(deleteID)

        )

      );

      setDeleteID(null);

      showSuccess('Admin deleted successfully.');

    } catch (err) {

      console.error('Error deleting admin:', err);

      setError(err.message || 'Cannot connect to the server.');

    } finally {

      setSaving(false);

    }

  }

  function closeModal() {

    setIsModalOpen(false);

    setEditID(null);

  }

  function handleLogoutClick() {
    if (typeof onLogout === 'function') {
      onLogout();
      return;
    }

    window.location.assign('/login');
  }

  const styles = {

    app: {

      minHeight: '100vh',

      backgroundColor: '#f7f8f7',

      color: '#17231d',

    },

    sidebar: {

      width: '248px',

      minHeight: '100vh',

      backgroundColor: '#ffffff',

      borderRight: '1px solid #e8ebe8',

      flexShrink: 0,

    },

    brandIcon: {

      width: '42px',

      height: '42px',

      borderRadius: '13px',

      backgroundColor: '#b7f76b',

      color: '#183c23',

      display: 'flex',

      alignItems: 'center',

      justifyContent: 'center',

      fontSize: '22px',

      fontWeight: '800',

    },

    navItem: {

      width: '100%',

      border: 'none',

      borderRadius: '10px',

      padding: '12px 14px',

      textAlign: 'left',

      fontSize: '14px',

      fontWeight: '500',

      transition: 'background-color 0.2s',

    },

    card: {

      backgroundColor: '#ffffff',

      border: '1px solid #e5e9e5',

      borderRadius: '20px',

      boxShadow: '0 2px 8px rgba(20, 40, 25, 0.025)',

    },

    input: {

      border: '1px solid #dfe5df',

      borderRadius: '10px',

      padding: '11px 13px',

      fontSize: '14px',

    },

    primaryButton: {

      backgroundColor: '#b7f76b',

      border: '1px solid #a5e95a',

      color: '#183c23',

      borderRadius: '10px',

      fontWeight: '600',

      padding: '10px 17px',

    },

    muted: {

      color: '#7b847e',

    },

  };

  function navigateTo(page) {

    setActivePage(page);

    setError('');

    setSuccess('');

  }

  return (

    <div style={styles.app} data-bs-theme="light">

      <div className="d-flex">

        <aside

          className="d-none d-lg-flex flex-column p-4"

          style={styles.sidebar}

        >

          <div className="d-flex align-items-center gap-3 mb-5">

            <div style={styles.brandIcon}>C</div>

            <div>

              <div className="fw-bold fs-5">Campus Tracker</div>

              <small style={styles.muted}>Management Portal</small>

            </div>

          </div>

          <small

            className="text-uppercase fw-semibold mb-3"

            style={{ ...styles.muted, letterSpacing: '1px' }}

          >

            Workspace

          </small>

          <nav className="d-flex flex-column gap-2">

            <button

              type="button"

              style={{

                ...styles.navItem,

                backgroundColor:

                  activePage === 'dashboard' ? '#edfade' : 'transparent',

                color: activePage === 'dashboard' ? '#376a25' : '#68736b',

              }}

              onClick={() => navigateTo('dashboard')}

            >

              <span className="me-3">▦</span>

              Dashboard

            </button>

            <button

              type="button"

              style={{

                ...styles.navItem,

                backgroundColor:

                  activePage === 'admins' ? '#edfade' : 'transparent',

                color: activePage === 'admins' ? '#376a25' : '#68736b',

              }}

              onClick={() => navigateTo('admins')}

            >

              <span className="me-3">♙</span>

              Admin Management

            </button>

          </nav>

          <div className="mt-auto pt-4 border-top">

            <div className="d-flex align-items-center gap-3 mb-3">

              <div

                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"

                style={{

                  width: '40px',

                  height: '40px',

                  backgroundColor: '#edfade',

                  color: '#376a25',

                }}

              >

                SA

              </div>

              <div className="overflow-hidden">

                <div className="fw-semibold small">Super Admin</div>

                <small style={styles.muted}>Administrator</small>

              </div>

            </div>

            {onLogout && (

              <button

                type="button"

                className="btn btn-outline-danger w-100"

                style={{ borderRadius: '10px' }}

                onClick={onLogout}

              >

                ↪ Logout

              </button>

            )}

          </div>

        </aside>

        <main className="flex-grow-1 overflow-hidden">

            <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-4 bg-white border-bottom">

                <div>

                    <h4 className="fw-bold mb-1">Superadmin Dashboard</h4>

                    <small className="text-secondary">

                    Manage and monitor your campus administrators.

                    </small>

                </div>

                <button

                    type="button"

                    className="btn btn-danger px-4 py-2"

                    onClick={handleLogoutClick}

                >

                    <i className="bi bi-box-arrow-right me-2"></i>

                    Logout

                </button>

                </header>

          <div className="p-3 p-md-4 p-xl-5">

            {error && (

              <div

                className="alert alert-danger d-flex justify-content-between align-items-start gap-2"

                role="alert"

              >

                <span>{error}</span>

                <button

                  type="button"

                  className="btn-close"

                  aria-label="Close error"

                  onClick={() => setError('')}

                />

              </div>

            )}

            {success && (

              <div

                className="alert alert-success d-flex justify-content-between align-items-center gap-2"

                role="status"

              >

                <span>{success}</span>

                <button

                  type="button"

                  className="btn-close"

                  aria-label="Close message"

                  onClick={() => setSuccess('')}

                />

              </div>

            )}

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">

              <div>

                <h5 className="fw-bold mb-1">Overview</h5>

                <small style={styles.muted}>

                  Your administrator statistics at a glance.

                </small>

              </div>

              <button

                type="button"

                className="btn btn-light border"

                style={{ borderRadius: '10px' }}

                onClick={fetchAdmins}

                disabled={loading}

              >

                ↻ Refresh

              </button>

            </div>

            <div className="row g-3 mb-4">

              <div className="col-12 col-sm-6 col-xl-4">

                <div className="p-4 h-100" style={styles.card}>

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <small style={styles.muted}>Total Admins</small>

                      <h2 className="fw-bold mt-3 mb-2">

                        {loading ? '—' : admins.length}

                      </h2>

                      <small style={{ color: '#438c31' }}>

                        ● Registered administrators

                      </small>

                    </div>

                    <div

                      className="d-flex align-items-center justify-content-center"

                      style={{

                        width: '48px',

                        height: '48px',

                        borderRadius: '15px',

                        backgroundColor: '#edfade',

                        color: '#438c31',

                        fontSize: '23px',

                      }}

                    >

                      ♙

                    </div>

                  </div>

                </div>

              </div>

              <div className="col-12 col-sm-6 col-xl-4">

                <div className="p-4 h-100" style={styles.card}>

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <small style={styles.muted}>Search Results</small>

                      <h2 className="fw-bold mt-3 mb-2">

                        {loading ? '—' : filteredAdmins.length}

                      </h2>

                      <small style={styles.muted}>

                        Matching administrators

                      </small>

                    </div>

                    <div

                      className="d-flex align-items-center justify-content-center"

                      style={{

                        width: '48px',

                        height: '48px',

                        borderRadius: '15px',

                        backgroundColor: '#eaf2ff',

                        color: '#3974d6',

                        fontSize: '23px',

                      }}

                    >

                      ⌕

                    </div>

                  </div>

                </div>

              </div>

              <div className="col-12 col-sm-6 col-xl-4">

                <div className="p-4 h-100" style={styles.card}>

                  <div className="d-flex justify-content-between align-items-start">

                    <div>

                      <small style={styles.muted}>System Status</small>

                      <h4 className="fw-bold mt-3 mb-2">

                        {loading ? 'Loading...' : error ? 'Check Server' : 'Ready'}

                      </h4>

                      <small style={{ color: error ? '#dc3545' : '#438c31' }}>

                        ● {error ? 'Connection needs attention' : 'Admin API'}

                      </small>

                    </div>

                    <div

                      className="d-flex align-items-center justify-content-center"

                      style={{

                        width: '48px',

                        height: '48px',

                        borderRadius: '15px',

                        backgroundColor: '#fff3df',

                        color: '#d98b19',

                        fontSize: '23px',

                      }}

                    >

                      ◷

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <section

              className="p-3 p-md-4 mb-4"

              style={styles.card}

            >

              <div className="d-flex align-items-center gap-3 mb-4">

                <div

                  className="d-flex align-items-center justify-content-center"

                  style={{

                    ...styles.brandIcon,

                    width: '44px',

                    height: '44px',

                    fontSize: '24px',

                  }}

                >

                  +

                </div>

                <div>

                  <h5 className="fw-bold mb-1">Add New Admin</h5>

                  <small style={styles.muted}>

                    Enter the administrator's details below.

                  </small>

                </div>

              </div>

              <form onSubmit={handleAdd}>

                <div className="row g-3 align-items-end">

                  <div className="col-12 col-md-5">

                    <label htmlFor="adminName" className="form-label small fw-semibold">

                      First Name

                    </label>

                    <input

                      id="adminName"

                      type="text"

                      className="form-control"

                      style={styles.input}

                      placeholder="Enter first name"

                      value={name}

                      onChange={(event) => setName(event.target.value)}

                      maxLength={100}

                      required

                    />

                  </div>

                  <div className="col-12 col-md-5">

                    <label htmlFor="adminLastName" className="form-label small fw-semibold">

                      Last Name

                    </label>

                    <input

                      id="adminLastName"

                      type="text"

                      className="form-control"

                      style={styles.input}

                      placeholder="Enter last name"

                      value={lastName}

                      onChange={(event) => setLastName(event.target.value)}

                      maxLength={100}

                      required

                    />

                  </div>

                  <div className="col-12 col-md-2">

                    <button

                      type="submit"

                      className="btn w-100"

                      style={styles.primaryButton}

                      disabled={saving}

                    >

                      {saving ? 'Saving...' : '+ Add Admin'}

                    </button>

                  </div>

                </div>

              </form>

            </section>

            <section style={styles.card} className="overflow-hidden">

              <div className="p-3 p-md-4">

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                  <div>

                    <h5 className="fw-bold mb-1">Administrator Directory</h5>

                    <small style={styles.muted}>

                      View and manage registered administrators.

                    </small>

                  </div>

                  <div style={{ maxWidth: '340px', width: '100%' }}>

                    <input

                      type="search"

                      className="form-control"

                      style={styles.input}

                      placeholder="⌕  Search admins..."

                      value={search}

                      onChange={(event) => setSearch(event.target.value)}

                      aria-label="Search administrators"

                    />

                  </div>

                </div>

              </div>

              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead>

                    <tr style={{ backgroundColor: '#f7f9f6' }}>

                      <th className="px-3 px-md-4 py-3 small text-secondary">

                        ADMINISTRATOR

                      </th>

                      <th className="py-3 small text-secondary">LAST NAME</th>

                      <th className="py-3 small text-secondary">STATUS</th>

                      <th className="px-3 px-md-4 py-3 small text-secondary text-end">

                        ACTIONS

                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {loading ? (

                      <tr>

                        <td colSpan="4" className="text-center py-5">

                          <div

                            className="spinner-border spinner-border-sm text-success me-2"

                            role="status"

                          />

                          Loading administrators...

                        </td>

                      </tr>

                    ) : filteredAdmins.length === 0 ? (

                      <tr>

                        <td

                          colSpan="4"

                          className="text-center py-5"

                          style={styles.muted}

                        >

                          {search

                            ? 'No administrators match your search.'

                            : 'No administrators found. Add one using the form above.'}

                        </td>

                      </tr>

                    ) : (

                      filteredAdmins.map((admin) => (

                        <tr key={admin.id}>

                          <td className="px-3 px-md-4 py-3">

                            <div className="d-flex align-items-center gap-3">

                              <div

                                className="d-flex align-items-center justify-content-center rounded-circle fw-bold"

                                style={{

                                  width: '42px',

                                  height: '42px',

                                  flexShrink: 0,

                                  backgroundColor: '#edfade',

                                  color: '#376a25',

                                }}

                              >

                                {(admin.name?.charAt(0) || '?').toUpperCase()}

                              </div>

                              <div>

                                <div className="fw-semibold">

                                  {admin.name}

                                </div>

                                <small style={styles.muted}>

                                  Admin ID: {admin.id}

                                </small>

                              </div>

                            </div>

                          </td>

                          <td className="py-3">{admin.lastName}</td>

                          <td className="py-3">

                            <span

                              className="badge rounded-pill px-3 py-2"

                              style={{

                                backgroundColor: '#edfade',

                                color: '#376a25',

                                fontWeight: '500',

                              }}

                            >

                              Active

                            </span>

                          </td>

                          <td className="px-3 px-md-4 py-3 text-end">

                            <div className="d-inline-flex gap-2">

                              <button

                                type="button"

                                className="btn btn-sm btn-outline-success"

                                style={{ borderRadius: '8px' }}

                                onClick={() => openEdit(admin)}

                                disabled={saving}

                              >

                                Edit

                              </button>

                              <button

                                type="button"

                                className="btn btn-sm btn-outline-danger"

                                style={{ borderRadius: '8px' }}

                                onClick={() => setDeleteID(admin.id)}

                                disabled={saving}

                              >

                                Delete

                              </button>

                            </div>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

              <div

                className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 px-md-4 py-3"

                style={{

                  borderTop: '1px solid #e8ebe8',

                  fontSize: '13px',

                  color: '#7b847e',

                }}

              >

                <span>

                  Showing {filteredAdmins.length} of {admins.length} admins

                </span>

                <span>Campus Tracker · Admin Panel</span>

              </div>

            </section>

          </div>

        </main>

      </div>

      {isModalOpen && (

        <div

          className="modal d-block"

          tabIndex="-1"

          role="dialog"

          aria-modal="true"

          style={{ backgroundColor: 'rgba(20, 30, 22, 0.45)' }}

          onMouseDown={(event) => {

            if (event.target === event.currentTarget && !saving) {

              closeModal();

            }

          }}

        >

          <div className="modal-dialog modal-dialog-centered">

            <div

              className="modal-content border-0"

              style={{ borderRadius: '20px', overflow: 'hidden' }}

            >

              <div className="modal-header px-4 py-3">

                <div>

                  <h5 className="modal-title fw-bold">Edit Administrator</h5>

                  <small style={styles.muted}>

                    Update the admin's name.

                  </small>

                </div>

                <button

                  type="button"

                  className="btn-close"

                  aria-label="Close"

                  onClick={closeModal}

                  disabled={saving}

                />

              </div>

              <form onSubmit={handleUpdate}>

                <div className="modal-body p-4">

                  {error && (

                    <div className="alert alert-danger" role="alert">

                      {error}

                    </div>

                  )}

                  <div className="mb-3">

                    <label htmlFor="editName" className="form-label small fw-semibold">

                      First Name

                    </label>

                    <input

                      id="editName"

                      type="text"

                      className="form-control"

                      style={styles.input}

                      value={editName}

                      onChange={(event) => setEditName(event.target.value)}

                      maxLength={100}

                      required

                    />

                  </div>

                  <div className="mb-3">

                    <label htmlFor="editLastName" className="form-label small fw-semibold">

                      Last Name

                    </label>

                    <input

                      id="editLastName"

                      type="text"

                      className="form-control"

                      style={styles.input}

                      value={editLastName}

                      onChange={(event) => setEditLastName(event.target.value)}

                      maxLength={100}

                      required

                    />

                  </div>

                </div>

                <div className="modal-footer px-4 py-3">

                  <button

                    type="button"

                    className="btn btn-light border"

                    onClick={closeModal}

                    disabled={saving}

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    className="btn"

                    style={styles.primaryButton}

                    disabled={saving}

                  >

                    {saving ? 'Saving...' : 'Save Changes'}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {deleteID !== null && (

        <div

          className="modal d-block"

          tabIndex="-1"

          role="dialog"

          aria-modal="true"

          style={{ backgroundColor: 'rgba(20, 30, 22, 0.45)' }}

        >

          <div className="modal-dialog modal-dialog-centered modal-sm">

            <div

              className="modal-content border-0"

              style={{ borderRadius: '18px' }}

            >

              <div className="modal-body text-center p-4">

                <div className="fs-1 mb-2">⚠</div>

                <h5 className="fw-bold">Delete Admin?</h5>

                <p className="text-secondary small">

                  Are you sure you want to delete this administrator? This

                  action cannot be undone.

                </p>

                <div className="d-flex justify-content-center gap-2 mt-4">

                  <button

                    type="button"

                    className="btn btn-light border"

                    onClick={() => setDeleteID(null)}

                    disabled={saving}

                  >

                    Cancel

                  </button>

                  <button

                    type="button"

                    className="btn btn-danger"

                    onClick={handleDelete}

                    disabled={saving}

                  >

                    {saving ? 'Deleting...' : 'Delete'}

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}
