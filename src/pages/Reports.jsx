import { useState } from 'react'
import { useInventory, CATEGORIES } from '../context/InventoryContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'

const stats = [
  { key: 'total', icon: 'bi-box-seam-fill', variant: 'primary', label: 'Total Items' },
  { key: 'stock', icon: 'bi-boxes', variant: 'success', label: 'Total Stock (units)' },
  { key: 'value', icon: 'bi-cash-stack', variant: 'warning', label: 'Inventory Value' },
  { key: 'low', icon: 'bi-exclamation-triangle-fill', variant: 'danger', label: 'Low Stock Items' },
]

function Reports() {
  const { items, totalQty, totalValue, lowStockItems } = useInventory()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [query, setQuery] = useState('')

  const statValues = {
    total: items.length,
    stock: totalQty.toLocaleString(),
    value: `₱${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    low: lowStockItems.length,
  }

  const allCategories = Array.from(
    new Set([...CATEGORIES, ...items.map((it) => it.category || 'Uncategorized')])
  )

  const filteredItems = items.filter((it) => {
    const q = query.toLowerCase().trim()
    const matchesQ = !q || it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q)
    const matchesCat = !selectedCategory || it.category === selectedCategory
    return matchesQ && matchesCat
  })

  const grouped = allCategories.reduce((acc, cat) => {
    const catItems = filteredItems.filter((it) => (it.category || 'Uncategorized') === cat)
    if (catItems.length > 0) {
      acc.push({
        category: cat,
        items: catItems,
        totalQty: catItems.reduce((sum, i) => sum + Number(i.qty || 0), 0),
        totalVal: catItems.reduce((sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0), 0),
      })
    }
    return acc
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="container-fluid bg-success-subtle p-3 p-md-4">
          <h1 className="fs-2 fw-bold mb-1">Inventory Reports</h1>
          <p className="text-body-secondary mb-4">
            A snapshot of your current supply stock levels and value.
          </p>

          <div className="row g-3 mb-4">
            {stats.map((s) => (
              <div className="col-6 col-lg-3" key={s.key}>
                <div className="card h-100">
                  <div className="card-body">
                    <span className={`stat-icon mb-3 text-bg-${s.variant}-subtle`}>
                      <i className={`bi ${s.icon} text-${s.variant}`}></i>
                    </span>
                    <div className="fs-4 fw-bold">{statValues[s.key]}</div>
                    <div className="text-body-secondary small">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mb-4">
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-sm-7">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search report by item name or code..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-5">
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-success fs-5 d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-table"></i> Supplies by Category Table
              </h3>

              {grouped.length === 0 ? (
                <div className="text-center text-body-secondary py-5">
                  No items match the report filter.
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {grouped.map((group) => (
                    <div key={group.category} className="border rounded overflow-hidden">
                      <div className="bg-body-secondary px-3 py-2 d-flex justify-content-between align-items-center">
                        <div className="fw-bold d-flex align-items-center gap-2">
                          <i className="bi bi-folder-fill text-success"></i>
                          <span>{group.category}</span>
                          <span className="badge text-bg-secondary ms-1">{group.items.length} items</span>
                        </div>
                        <div className="small text-body-secondary">
                          Total Stock: <strong>{group.totalQty}</strong> | Value: <strong>₱{group.totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr className="text-body-secondary small text-uppercase">
                              <th className="ps-3">Code</th>
                              <th>Item</th>
                              <th>Qty</th>
                              <th>Reorder</th>
                              <th>Unit Price</th>
                              <th>Total Value</th>
                              <th>Status</th>
                              <th>Supplier</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((it) => {
                              const isLow = Number(it.qty) <= Number(it.reorder)
                              const itemTotal = Number(it.qty) * Number(it.price)
                              return (
                                <tr key={it.id}>
                                  <td className="ps-3">{it.code}</td>
                                  <td className="fw-semibold">{it.name}</td>
                                  <td>{it.qty}</td>
                                  <td className="text-body-secondary">{it.reorder}</td>
                                  <td>₱{Number(it.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td className="fw-semibold">₱{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
                                  <td>{it.supplier || '—'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
