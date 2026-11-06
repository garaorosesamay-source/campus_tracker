import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInventory, CATEGORIES } from '../context/InventoryContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import ItemTable from '../components/ItemTable.jsx'

function Inventory() {
  const { updateItem } = useInventory()
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({
    code: '',
    name: '',
    category: '',
    qty: 0,
    reorder: 0,
    price: 0,
    supplier: '',
  })
  const [editError, setEditError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function handleStartEdit(item) {
    setEditingItem(item)
    setEditForm({
      code: item.code || '',
      name: item.name || '',
      category: item.category || CATEGORIES[0],
      qty: item.qty ?? 0,
      reorder: item.reorder ?? 0,
      price: item.price ?? 0,
      supplier: item.supplier || '',
    })
    setEditError('')
  }

  function handleSaveEdit(e) {
    e.preventDefault()

    if (!editForm.name.trim() || !editForm.code.trim()) {
      setEditError('Item Code and Item Name are required.')
      return
    }

    updateItem(editingItem.id, {
      ...editForm,
      qty: Number(editForm.qty) || 0,
      reorder: Number(editForm.reorder) || 0,
      price: Number(editForm.price) || 0,
    })

    setSuccessMessage(`Item "${editForm.name}" updated successfully.`)
    setEditingItem(null)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="container-fluid bg-success-subtle p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row md-items-center justify-content-between mb-4 gap-2">
            <div>
              <h1 className="fs-2 fw-bold mb-1">School Supplies Inventory</h1>
              <p className="text-body-secondary mb-0">
                Keep track of stock levels, prices, and suppliers for every classroom and office item.
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/add" className="btn btn-success d-flex align-items-center gap-2">
                <i className="bi bi-plus-circle-fill"></i>
                <span>Add Item</span>
              </Link>
            </div>
          </div>

          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-check-circle-fill fs-5"></i>
              <div>{successMessage}</div>
              <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
            </div>
          )}

          <ItemTable onEdit={handleStartEdit} />
        </div>
      </div>

      {editingItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-pencil-square"></i> Update Item Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditingItem(null)}
                ></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  {editError && <div className="alert alert-danger py-2 small mb-3">{editError}</div>}

                  <div className="row g-2 mb-3">
                    <div className="col-5">
                      <label className="form-label small fw-semibold">Item Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.code}
                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-7">
                      <label className="form-label small fw-semibold">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.qty}
                        onChange={(e) => setEditForm({ ...editForm, qty: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Reorder Level</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.reorder}
                        onChange={(e) => setEditForm({ ...editForm, reorder: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Unit Price (₱)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Supplier</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.supplier}
                        onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                        placeholder="e.g. National Bookstore"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success d-flex align-items-center gap-1">
                    <i className="bi bi-check-lg"></i> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
