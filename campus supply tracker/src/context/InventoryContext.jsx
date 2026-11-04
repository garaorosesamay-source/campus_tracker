import { createContext, useContext, useState, useEffect } from 'react'

const ITEMS_KEY = 'supplyInventoryItems'

const seedItems = [
  { id: 1, code: 'SUP-0001', name: 'Ballpen (Black)', category: 'Writing Materials', qty: 145, reorder: 30, price: 8.5, supplier: 'National Bookstore' },
  { id: 2, code: 'SUP-0002', name: 'Bond Paper A4 (Ream)', category: 'Paper Products', qty: 12, reorder: 15, price: 195, supplier: 'Office Warehouse' },
  { id: 3, code: 'SUP-0003', name: 'Whiteboard Marker', category: 'Writing Materials', qty: 8, reorder: 20, price: 25, supplier: 'National Bookstore' },
  { id: 4, code: 'SUP-0004', name: 'Manila Paper', category: 'Art Supplies', qty: 60, reorder: 25, price: 6, supplier: 'CDO Trading' },
  { id: 5, code: 'SUP-0005', name: 'Stapler (Heavy Duty)', category: 'Office Equipment', qty: 5, reorder: 5, price: 210, supplier: 'Office Warehouse' },
  { id: 6, code: 'SUP-0006', name: 'Expanding Folder', category: 'Filing & Storage', qty: 40, reorder: 15, price: 18, supplier: 'CDO Trading' },
]

export const CATEGORIES = [
  'Writing Materials',
  'Paper Products',
  'Art Supplies',
  'Office Equipment',
  'Filing & Storage',
  'Cleaning Supplies',
]

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ITEMS_KEY))
      return saved && saved.length > 0 ? saved : seedItems
    } catch {
      return seedItems
    }
  })

  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  }, [items])

  function addItem(item) {
    const newItem = { ...item, id: crypto.randomUUID() }
    setItems((prev) => [newItem, ...prev])
  }

  function updateItem(id, updatedFields) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updatedFields } : it)))
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const lowStockItems = items.filter((it) => Number(it.qty) <= Number(it.reorder))
  const totalQty = items.reduce((sum, it) => sum + Number(it.qty), 0)
  const totalValue = items.reduce((sum, it) => sum + Number(it.qty) * Number(it.price), 0)

  const value = { items, addItem, updateItem, deleteItem, lowStockItems, totalQty, totalValue }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  return useContext(InventoryContext)
}
