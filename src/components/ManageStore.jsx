import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const ManageStore = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [inventoryOverview, setInventoryOverview] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    location: '',
    phone: '',
    email: '',
    operatingHours: '',
  });

  useEffect(() => {
    const fetchStoreAndInventory = async () => {
      try {
        // Using the new custom endpoint: /api/manage-store/:id
        const res = await fetch(`http://localhost:8080/api/manage-store/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch store + inventory data');
        }
        const data = await res.json();
        /*
          data = {
            store: { _id, storeName, ... },
            inventorySummary: { totalItems: 123 },
            inventoryOverview: [ { _id, name, quantity, lastUpdated }, ... ]
          }
        */
        if (!data.store) {
          return setError('Store not found.');
        }
        setStore(data.store);
        setInventorySummary(data.inventorySummary);
        setInventoryOverview(data.inventoryOverview);

        // set initial form
        setFormData({
          storeName: data.store.storeName,
          location: data.store.location,
          phone: data.store.phone,
          email: data.store.email,
          operatingHours: data.store.operatingHours,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStoreAndInventory();
  }, [id]);

  const handleEditClick = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditMode(false);
    if (store) {
      setFormData({
        storeName: store.storeName,
        location: store.location,
        phone: store.phone,
        email: store.email,
        operatingHours: store.operatingHours,
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // We can still do a PUT /api/stores/:id for store updates
      const res = await fetch(`http://localhost:8080/api/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error('Failed to update store');
      }
      const updated = await res.json();
      setStore(updated);
      setEditMode(false);
      alert('Store updated successfully');
    } catch (error) {
      alert(error.message);
    }
  };

  // Filter logic for inventory
  const filteredInventory = inventoryOverview.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="ml-[210px] mt-20">Loading store details...</div>;
  }
  if (error) {
    return <div className="ml-[210px] mt-20 text-red-500">Error: {error}</div>;
  }
  if (!store) {
    return <div className="ml-[210px] mt-20">No store found.</div>;
  }

  return (
    <div className="ml-[210px] xl:ml-[328px] p-4 bg-gray-50 mt-16">
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">
            Store: {store.storeName}
          </h2>
          {!editMode && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={handleEditClick}
            >
              Edit Store
            </button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSave}>
            {/* storeName */}
            <div className="mb-2 flex items-center">
              <label className="w-1/4 text-gray-700">Store Name</label>
              <input
                className="w-3/4 p-2 border rounded"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
              />
            </div>
            {/* location */}
            <div className="mb-2 flex items-center">
              <label className="w-1/4 text-gray-700">Location</label>
              <input
                className="w-3/4 p-2 border rounded"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            {/* phone */}
            <div className="mb-2 flex items-center">
              <label className="w-1/4 text-gray-700">Phone</label>
              <input
                className="w-3/4 p-2 border rounded"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            {/* email */}
            <div className="mb-2 flex items-center">
              <label className="w-1/4 text-gray-700">Email</label>
              <input
                className="w-3/4 p-2 border rounded"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {/* operatingHours */}
            <div className="mb-2 flex items-center">
              <label className="w-1/4 text-gray-700">Operating Hours</label>
              <input
                className="w-3/4 p-2 border rounded"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p><strong>Location:</strong> {store.location}</p>
            <p><strong>Phone:</strong> {store.phone}</p>
            <p><strong>Email:</strong> {store.email}</p>
            <p><strong>Operating Hours:</strong> {store.operatingHours}</p>
          </div>
        )}
      </div>

      {/* Inventory Summary */}
      {inventorySummary && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-2">Inventory Summary</h2>
          <p>Total Items: {inventorySummary.totalItems}</p>
        </div>
      )}

      {/* Inventory Overview */}
      {inventoryOverview && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Inventory Overview</h2>
            <div className="flex items-center space-x-2">
              <div className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg flex items-center">
                <FaSearch className="mr-2" />
                <input
                  className="outline-none"
                  type="text"
                  placeholder="Search items"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 text-center border-b border-gray-300">Item Name</th>
                <th className="py-3 px-4 text-center border-b border-gray-300">Quantity</th>
                <th className="py-3 px-4 text-center border-b border-gray-300">Location</th>
                <th className="py-3 px-4 text-center border-b border-gray-300">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item._id}>
                  <td className="py-3 px-4 text-center border-b border-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-center border-b border-gray-300">{item.quantity}</td>
                  <td className="py-3 px-4 text-center border-b border-gray-300">Main Store</td>
                  <td className="py-3 px-4 text-center border-b border-gray-300">
                    {new Date(item.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageStore;
