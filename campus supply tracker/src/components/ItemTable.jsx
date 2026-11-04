import { useState } from 'react'
import { useInventory, CATEGORIES } from '../context/InventoryContext.jsx'

function ItemTable({ onEdit }) {
  const { items, deleteItem } = useInventory()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const filtered = items.filter((it) => {
    const q = query.toLowerCase()
    const matchesQ = it.code.toLowerCase().includes(q) || it.name.toLowerCase().includes(q)
    const matchesCat = !category || it.category === category
    return matchesQ && matchesCat
  })

  function handleDelete(item) {
    if (confirm(`Delete ${item.name}? This can't be undone.`)) {
      deleteItem(item.id)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
          <div className="input-group flex-grow-1">
            <span className="input-group-text bg-body-tertiary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by item name or code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ maxWidth: '220px' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-body-secondary py-5">
            {items.length === 0 ? 'No items yet. Add one to get started.' : 'No items match your search.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="text-body-secondary small text-uppercase">
                  <th>Code</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const isLow = Number(it.qty) <= Number(it.reorder)
                  return (
                    <tr key={it.id}>
                      <td>{it.code}</td>
                      <td>{it.name}</td>
                      <td>{it.category}</td>
                      <td>{it.qty}</td>
                      <td>₱{Number(it.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>
                        {isLow ? (
                          <span className="badge text-bg-danger-subtle text-danger-emphasis d-inline-flex align-items-center gap-1">
                            <i className="bi bi-exclamation-triangle-fill"></i> Low Stock
                          </span>
                        ) : (
                          <span className="badge text-bg-success-subtle text-success-emphasis d-inline-flex align-items-center gap-1">
                            <i className="bi bi-check-circle-fill"></i> In Stock
                          </span>
                        )}
                      </td>
                      <td>{it.supplier}</td>
                      <td className="text-nowrap text-end pe-3">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => onEdit(it)}
                            title="Edit Item"
                          >
                            <i className="bi bi-pencil-square me-1"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(it)}
                            title="Delete Item"
                          >
                            <i className="bi bi-trash3-fill me-1"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemTable
