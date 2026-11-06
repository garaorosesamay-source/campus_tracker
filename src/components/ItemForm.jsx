import { useState, useEffect } from 'react'
import { CATEGORIES } from '../context/InventoryContext.jsx'

const emptyForm = { code: '', name: '', category: CATEGORIES[0], qty: '', reorder: '', price: '', supplier: '' }

function ItemForm({ editingItem, onSave, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingItem) {
      setForm({
        code: editingItem.code,
        name: editingItem.name,
        category: editingItem.category,
        qty: editingItem.qty,
        reorder: editingItem.reorder,
        price: editingItem.price,
        supplier: editingItem.supplier,
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [editingItem])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.code.trim() || !form.name.trim()) {
      setError('Item Code and Item Name are required.')
      return
    }

    setError('')
    onSave({
      ...form,
      qty: Number(form.qty) || 0,
      reorder: Number(form.reorder) || 0,
      price: Number(form.price) || 0,
    })
    setForm(emptyForm)
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title text-success fs-5 d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-clipboard-plus-fill"></i>
          {editingItem ? 'Update Item' : 'Add / Update Item'}
        </h3>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small">Item Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SUP-0012"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small">Item Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ballpen (Black)"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label small">Quantity</label>
              <input
                type="number" min="0" className="form-control" placeholder="0"
                value={form.qty}
                onChange={(e) => handleChange('qty', e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label small">Reorder Level</label>
              <input
                type="number" min="0" className="form-control" placeholder="0"
                value={form.reorder}
                onChange={(e) => handleChange('reorder', e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small">Unit Price (₱)</label>
            <input
              type="number" min="0" step="0.01" className="form-control" placeholder="0.00"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small">Supplier</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. National Bookstore"
              value={form.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-save-fill"></i>
            {editingItem ? 'Update Item' : 'Save Item'}
          </button>

          {editingItem && (
            <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={onCancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default ItemForm
