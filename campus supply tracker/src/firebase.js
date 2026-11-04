
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const API_URL = "http://localhost:8080/api/admins";

export default function SuperAdminDashboard({ onLogout }) {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");

  const [editID, setEditID] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteID, setDeleteID] = useState(null);

  const [activePage, setActivePage] = useState("dashboard");

  // Wait until Firebase finishes restoring the login session.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setAuthReady(true);
      },
      (authError) => {
        console.error("Firebase auth error:", authError);
        setError("Hindi ma-verify ang Firebase login.");
        setAuthReady(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // Authenticated API request.
  async function authenticatedFetch(url, options = {}) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error(
        "Walang naka-login na Firebase user. Mag-login ulit."
      );
    }

    // Force refresh to get a current Firebase ID token.
    const token = await currentUser.getIdToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  }

  async function readResponse(response) {
    const text = await response.text();

    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function fetchAdmins() {
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(API_URL);
      const data = await readResponse(response);

      if (!Array.isArray(data)) {
        throw new Error("Invalid response mula sa Admin API.");
      }

      setAdmins(data);
    } catch (err) {
      console.error("Error loading admins:", err);
      setError(err.message || "Hindi ma-load ang admins.");
    } finally {
      setLoading(false);
    }
  }

  // Only fetch after Firebase auth has initialized.
  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setLoading(false);
      setAdmins([]);
      setError("Walang naka-login na Firebase user. Mag-login ulit.");
      return;
    }

    fetchAdmins();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  const filteredAdmins = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return admins.filter((admin) => {
      const fullName =
        `${admin.name || ""} ${admin.lastName || ""}`.toLowerCase();

      const email = (admin.email || "").toLowerCase();
      const username = (admin.username || "").toLowerCase();

      return (
        fullName.includes(keyword) ||
        email.includes(keyword) ||
        username.includes(keyword)
      );
    });
  }, [admins, search]);

  function showSuccess(message) {
    setSuccess(message);
    setError("");
  }

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function handleAdd(event) {
    event.preventDefault();
    clearMessages();

    const cleanName = name.trim();
    const cleanLastName = lastName.trim();

    if (!cleanName || !cleanLastName) {
      setError("Ilagay ang first name at last name.");
      return;
    }

    if (cleanName.length > 150 || cleanLastName.length > 150) {
      setError("Maximum na 150 characters bawat pangalan.");
      return;
    }

    setSaving(true);

    try {
      const response = await authenticatedFetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          lastName: cleanLastName,
        }),
      });

      const data = await readResponse(response);

      // Reload the directory from the database.
      await fetchAdmins();

      setName("");
      setLastName("");

      showSuccess("Matagumpay na naidagdag ang admin.");
    } catch (err) {
      console.error("Add admin error:", err);
      setError(err.message || "Hindi maidagdag ang admin.");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(admin) {
    setEditID(admin.id);
    setEditName(admin.name || "");
    setEditLastName(admin.lastName || "");

    clearMessages();
    setIsModalOpen(true);
  }

  async function handleUpdate(event) {
    event.preventDefault();
    clearMessages();

    if (!editID) return;

    const cleanName = editName.trim();
    const cleanLastName = editLastName.trim();

    if (!cleanName || !cleanLastName) {
      setError("Ilagay ang first name at last name.");
      return;
    }

    if (cleanName.length > 150 || cleanLastName.length > 150) {
      setError("Maximum na 150 characters bawat pangalan.");
      return;
    }

    setSaving(true);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/${encodeURIComponent(editID)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            lastName: cleanLastName,
          }),
        }
      );

      await readResponse(response);
      await fetchAdmins();

      setIsModalOpen(false);
      setEditID(null);

      showSuccess("Matagumpay na na-update ang admin.");
    } catch (err) {
      console.error("Update admin error:", err);
      setError(err.message || "Hindi ma-update ang admin.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteID === null) return;

    clearMessages();
    setSaving(true);

    try {
      const response = await authenticatedFetch(
        `${API_URL}/${encodeURIComponent(deleteID)}`,
        {
          method: "DELETE",
        }
      );

      await readResponse(response);
      await fetchAdmins();

      setDeleteID(null);

      showSuccess("Matagumpay na na-delete ang admin record.");
    } catch (err) {
      console.error("Delete admin error:", err);
      setError(err.message || "Hindi ma-delete ang admin.");
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    if (saving) return;

    setIsModalOpen(false);
    setEditID(null);
  }

  async function handleLogoutClick() {
    clearMessages();

    try {
      if (typeof onLogout === "function") {
        // Parent should perform Firebase signOut.
        await onLogout();
        return;
      }

      // Fallback: sign out using the shared Firebase instance.
      const { signOut } = await import("firebase/auth");

      await signOut(auth);
      window.location.assign("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Hindi makapag-logout. Subukan ulit.");
    }
  }

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#f7f8f7",
      color: "#17231d",
      fontFamily: "Arial, sans-serif",
    },
    sidebar: {
      width: 248,
      minHeight: "100vh",
      background: "#fff",
      borderRight: "1px solid #e8ebe8",
      padding: 24,
      boxSizing: "border-box",
      flexShrink: 0,
    },
    brandIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      background: "#b7f76b",
      color: "#183c23",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      fontWeight: 800,
    },
    card: {
      background: "#fff",
      border: "1px solid #e5e9e5",
      borderRadius: 16,
      padding: 22,
      boxShadow: "0 2px 8px rgba(20,40,25,.025)",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #dfe5df",
      borderRadius: 9,
      padding: "11px 13px",
      fontSize: 14,
      outlineOffset: 2,
    },
    primaryButton: {
      background: "#b7f76b",
      border: "1px solid #a5e95a",
      color: "#183c23",
      borderRadius: 9,
      fontWeight: 700,
      padding: "10px 16px",
      cursor: "pointer",
    },
    secondaryButton: {
      background: "#fff",
      border: "1px solid #dfe5df",
      color: "#27352b",
      borderRadius: 9,
      fontWeight: 600,
      padding: "9px 14px",
      cursor: "pointer",
    },
    muted: {
      color: "#7b847e",
    },
    navItem: (active) => ({
      width: "100%",
      border: "none",
      borderRadius: 9,
      padding: "12px 14px",
      textAlign: "left",
      fontSize: 14,
      fontWeight: active ? 700 : 500,
      background: active ? "#eff9e6" : "transparent",
      color: active ? "#285b26" : "#536057",
      cursor: "pointer",
      marginBottom: 5,
    }),
    tableCell: {
      padding: "14px 12px",
      borderBottom: "1px solid #edf0ed",
      textAlign: "left",
      fontSize: 14,
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 1000,
    },
    modal: {
      width: "100%",
      maxWidth: 480,
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxSizing: "border-box",
      boxShadow: "0 12px 40px rgba(0,0,0,.15)",
    },
  };

  return (
    <div style={styles.app}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <aside
          style={{
            ...styles.sidebar,
            display: window.innerWidth >= 992 ? "flex" : "none",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div style={styles.brandIcon}>C</div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                Campus Tracker
              </div>
              <small style={styles.muted}>Management Portal</small>
            </div>
          </div>

          <small
            style={{
              ...styles.muted,
              display: "block",
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            MAIN MENU
          </small>

          <button
            style={styles.navItem(activePage === "dashboard")}
            onClick={() => {
              setActivePage("dashboard");
              clearMessages();
            }}
          >
            ▦ &nbsp; Dashboard
          </button>

          <button
            style={styles.navItem(activePage === "admins")}
            onClick={() => {
              setActivePage("admins");
              clearMessages();
            }}
          >
            ♙ &nbsp; Admin Directory
          </button>

          <div style={{ flex: 1 }} />

          <div
            style={{
              borderTop: "1px solid #edf0ed",
              paddingTop: 18,
              marginTop: 24,
            }}
          >
            <div
              style={{
                fontSize: 12,
                ...styles.muted,
                marginBottom: 10,
              }}
            >
              SIGNED IN AS
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                overflowWrap: "anywhere",
                marginBottom: 14,
              }}
            >
              {user?.email || "Authenticated user"}
            </div>

            <button
              style={{
                ...styles.secondaryButton,
                width: "100%",
              }}
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "28px clamp(16px, 3vw, 36px)",
          }}
        >
          {/* HEADER */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div>
              <div style={{ fontSize: 13, ...styles.muted }}>
                Campus Tracker / Management
              </div>

              <h1 style={{ fontSize: 26, margin: "8px 0" }}>
                Super Admin Dashboard
              </h1>

              <div style={{ fontSize: 14, ...styles.muted }}>
                Manage your administrator directory.
              </div>
            </div>

            <button
              style={styles.secondaryButton}
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </header>

          {/* NOTIFICATIONS */}
          {error && (
            <div
              role="alert"
              style={{
                padding: 14,
                marginBottom: 18,
                borderRadius: 10,
                background: "#fff0f0",
                color: "#a32020",
                border: "1px solid #ffd0d0",
                fontSize: 14,
              }}
            >
              <strong>Error:</strong> {error}

              {user && (
                <button
                  style={{
                    ...styles.secondaryButton,
                    marginLeft: 12,
                  }}
                  onClick={fetchAdmins}
                  disabled={loading}
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                padding: 14,
                marginBottom: 18,
                borderRadius: 10,
                background: "#eff9e6",
                color: "#285b26",
                border: "1px solid #d4efbc",
                fontSize: 14,
              }}
            >
              {success}
            </div>
          )}

          {/* OVERVIEW CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(min(100%,220px),1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={styles.card}>
              <div style={styles.muted}>Total Admin Records</div>

              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12 }}>
                {loading ? "—" : admins.length}
              </div>

              <small style={styles.muted}>
                Directory records
              </small>
            </div>

            <div style={styles.card}>
              <div style={styles.muted}>Search Results</div>

              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12 }}>
                {loading ? "—" : filteredAdmins.length}
              </div>

              <small style={styles.muted}>
                Matching administrators
              </small>
            </div>

            <div style={styles.card}>
              <div style={styles.muted}>System Status</div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  marginTop: 12,
                }}
              >
                {!authReady
                  ? "Authenticating..."
                  : loading
                    ? "Loading..."
                    : error
                      ? "Check Server"
                      : "Ready"}
              </div>

              <small
                style={{
                  color: error ? "#c62828" : "#438c31",
                }}
              >
                ● {error ? "Connection needs attention" : "Admin API"}
              </small>
            </div>
          </div>

          {/* DIRECTORY PAGE */}
          {activePage === "admins" && (
            <div style={styles.card}>
              <h2 style={{ marginTop: 0 }}>Admin Directory</h2>

              <p style={styles.muted}>
                Search, add, update, or remove directory records.
              </p>

              <button
                style={styles.primaryButton}
                onClick={() => {
                  setName("");
                  setLastName("");
                  clearMessages();

                  // Open add dialog using editID null.
                  setEditID(null);
                  setIsModalOpen(true);
                }}
              >
                + Add Admin
              </button>
            </div>
          )}

          {/* ADMIN TABLE */}
          <section style={{ ...styles.card, marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: 19 }}>
                  Administrators
                </h2>

                <small style={styles.muted}>
                  Admin directory records
                </small>
              </div>

              <button
                style={styles.primaryButton}
                onClick={() => {
                  setName("");
                  setLastName("");
                  setEditID(null);
                  clearMessages();
                  setIsModalOpen(true);
                }}
              >
                + Add Admin
              </button>
            </div>

            {/* SEARCH */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="search"
                placeholder="Search name, email, or username..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={styles.input}
                aria-label="Search administrators"
              />
            </div>

            {/* TABLE */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 680,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8faf8" }}>
                    <th style={styles.tableCell}>Admin</th>
                    <th style={styles.tableCell}>Username</th>
                    <th style={styles.tableCell}>Email</th>
                    <th style={styles.tableCell}>Role</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          ...styles.tableCell,
                          textAlign: "center",
                          padding: 32,
                        }}
                      >
                        Loading admin records...
                      </td>
                    </tr>
                  ) : filteredAdmins.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          ...styles.tableCell,
                          textAlign: "center",
                          padding: 32,
                          color: "#7b847e",
                        }}
                      >
                        {error
                          ? "Hindi ma-load ang records."
                          : "Walang nahanap na admin."}
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: 700 }}>
                            {admin.name} {admin.lastName}
                          </div>
                          <small style={styles.muted}>
                            ID: {admin.id}
                          </small>
                        </td>

                        <td style={styles.tableCell}>
                          {admin.username || "—"}
                        </td>

                        <td style={styles.tableCell}>
                          {admin.email || "—"}
                        </td>

                        <td style={styles.tableCell}>
                          {admin.role || "—"}
                        </td>

                        <td style={styles.tableCell}>
                          {admin.status || "Directory record"}
                        </td>

                        <td style={styles.tableCell}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              style={styles.secondaryButton}
                              onClick={() => openEdit(admin)}
                            >
                              Edit
                            </button>

                            <button
                              style={{
                                ...styles.secondaryButton,
                                color: "#b42318",
                              }}
                              onClick={() => {
                                clearMessages();
                                setDeleteID(admin.id);
                              }}
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
              style={{
                borderTop: "1px solid #edf0ed",
                marginTop: 16,
                paddingTop: 14,
                ...styles.muted,
                fontSize: 13,
              }}
            >
              Showing {loading ? "—" : filteredAdmins.length} of{" "}
              {loading ? "—" : admins.length} records
            </div>
          </section>

          {/* MOBILE NAVIGATION */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <button
              style={styles.secondaryButton}
              onClick={() => setActivePage("dashboard")}
            >
              Dashboard
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => setActivePage("admins")}
            >
              Admin Directory
            </button>
          </div>
        </main>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div
          style={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >
            <h2
              id="admin-modal-title"
              style={{ marginTop: 0, marginBottom: 8 }}
            >
              {editID !== null ? "Edit Admin" : "Add Admin"}
            </h2>

            <p style={{ ...styles.muted, fontSize: 14 }}>
              {editID !== null
                ? "Update administrator directory information."
                : "Add an administrator directory record."}
            </p>

            <form
              onSubmit={
                editID !== null ? handleUpdate : handleAdd
              }
            >
              <div style={{ marginTop: 20 }}>
                <label
                  htmlFor="admin-first-name"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  First Name
                </label>

                <input
                  id="admin-first-name"
                  style={styles.input}
                  value={editID !== null ? editName : name}
                  onChange={(event) =>
                    editID !== null
                      ? setEditName(event.target.value)
                      : setName(event.target.value)
                  }
                  maxLength={150}
                  required
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <label
                  htmlFor="admin-last-name"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Last Name
                </label>

                <input
                  id="admin-last-name"
                  style={styles.input}
                  value={editID !== null ? editLastName : lastName}
                  onChange={(event) =>
                    editID !== null
                      ? setEditLastName(event.target.value)
                      : setLastName(event.target.value)
                  }
                  maxLength={150}
                  required
                />
              </div>

              {editID === null && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#7b847e",
                    lineHeight: 1.6,
                    marginTop: 12,
                  }}
                >
                  Directory record lamang ito. Hindi ito awtomatikong
                  gagawa ng Firebase login account.
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 24,
                }}
              >
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editID !== null
                      ? "Save Changes"
                      : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteID !== null && (
        <div
          style={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setDeleteID(null);
            }
          }}
        >
          <div
            style={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title" style={{ marginTop: 0 }}>
              Delete Admin Record?
            </h2>

            <p style={{ color: "#69736c", lineHeight: 1.6 }}>
              Sigurado ka bang gusto mong i-delete ang directory record
              na ito? Hindi ito basta maibabalik.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 24,
              }}
            >
              <button
                style={styles.secondaryButton}
                onClick={() => setDeleteID(null)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                style={{
                  ...styles.primaryButton,
                  background: "#dc3545",
                  borderColor: "#dc3545",
                  color: "#fff",
                }}
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
