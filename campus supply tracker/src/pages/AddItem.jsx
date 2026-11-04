import { useNavigate } from 'react-router-dom'
import { useInventory } from '../context/InventoryContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import ItemForm from '../components/ItemForm.jsx'

function AddItem() {
  const { addItem } = useInventory()
  const navigate = useNavigate()

  function handleSave(formValues) {
    addItem(formValues)
    navigate('/inventory')
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="container-fluid bg-success-subtle p-3 p-md-4">
          <h1 className="fs-2 fw-bold mb-1">Add Item</h1>
          <p className="text-body-secondary mb-4">Enter the new supply item's details below.</p>

          <div className="row">
            <div className="col-12 col-md-6 col-lg-5">
              <ItemForm editingItem={null} onSave={handleSave} onCancelEdit={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddItem
