// PS-IMS-NEW-FE/src/components/StoresList.jsx
import React, { useEffect, useState } from 'react';
import AddStoreForm from './AddStoreForm'; // We'll create this
import { useNavigate } from 'react-router-dom';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  // Fetch all stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/stores');
        if (!res.ok) {
          throw new Error('Failed to fetch stores');
        }
        const data = await res.json();
        setStores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const handleAddStoreClick = () => {
    setShowAddForm(true);
  };

  const handleAddStoreSuccess = (newStore) => {
    // We'll just add the new store to the list, or re-fetch
    setStores((prev) => [...prev, newStore]);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="ml-[210px] mt-20">Loading stores...</div>;
  }
  if (error) {
    return <div className="ml-[210px] mt-20 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="ml-[210px] xl:ml-[328px] p-4 bg-gray-50 mt-16 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Branches</h2>
        <button
          onClick={handleAddStoreClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Store
        </button>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div key={store._id} className="bg-white shadow p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-1">{store.storeName}</h3>
            <p className="text-sm text-gray-600">Location: {store.location}</p>
            <p className="text-sm text-gray-600">Phone: {store.phone}</p>
            <p className="text-sm text-gray-600">Email: {store.email}</p>
            <p className="text-sm text-gray-600">
              Hours: {store.operatingHours}
            </p>
            <button
              className="mt-3 bg-green-500 text-white px-3 py-1 rounded"
              onClick={() => navigate(`/app/manage-store/${store._id}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {showAddForm && (
        <AddStoreForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddStoreSuccess}
        />
      )}
    </div>
  );
};

export default StoresList;
