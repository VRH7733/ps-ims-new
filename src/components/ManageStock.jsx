import React, { useEffect, useState } from 'react';

// A simple reusable modal component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-md shadow-lg w-full max-w-md mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ManageStock() {
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);

  // Loading and error states for feedback
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [error, setError] = useState('');

  // Selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // Search term for filtering users
  const [searchTerm, setSearchTerm] = useState('');

  // Stock editing via modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockBeingEdited, setStockBeingEdited] = useState(null);
  const [editQty, setEditQty] = useState('');

  // 1) Fetch all users on mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/users/getAlluser', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError('Error fetching users');
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchAllUsers();
  }, []);

  // 2) Fetch all stocks on mount
  useEffect(() => {
    const fetchAllStock = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/stock', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch stock');
        const data = await res.json();
        setStocks(data);
      } catch (err) {
        setError('Error fetching stocks');
        console.error(err);
      } finally {
        setLoadingStocks(false);
      }
    };
    fetchAllStock();
  }, []);

  // Filter user's stock if a user is selected
  const filteredStock = selectedUser
    ? stocks.filter((s) => {
      if (typeof s.user === 'string') {
        return s.user === selectedUser._id;
      }
      return s.user?._id === selectedUser._id;
    })
    : [];

  // Filter users by search term
  const filteredUsers = searchTerm
    ? users.filter((user) => {
      return user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ? true
        : false;
    })
    : users;

  // Handlers
  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleDeselectUser = () => {
    setSelectedUser(null);
  };

  // Modal open for editing
  const openEditModal = (stockItem) => {
    setStockBeingEdited(stockItem);
    setEditQty(stockItem.qty);
    setIsModalOpen(true);
  };

  // Modal close
  const closeModal = () => {
    setIsModalOpen(false);
    setStockBeingEdited(null);
    setEditQty('');
  };

  const handleSaveChanges = async () => {
    if (!stockBeingEdited) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:8080/api/stock/${stockBeingEdited._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product:
              stockBeingEdited.product?._id || stockBeingEdited.product,
            store: stockBeingEdited.store?._id || stockBeingEdited.store,
            user:
              typeof stockBeingEdited.user === 'string'
                ? stockBeingEdited.user
                : stockBeingEdited.user?._id,
            qty: editQty,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to update stock');

      const updated = await res.json();
      // Update local array
      setStocks((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );

      closeModal();
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock');
    }
  };

  return (
    <div className="ml-[210px] xl:ml-[328px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Stock</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column: Users */}
        <div className="border border-gray-300 rounded p-4 h-[90vh] flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Users</h2>

          {/* Search bar */}
          <div className="mb-4">
            <input
              className="border w-full rounded px-3 py-2"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User list (scrollable) */}
          <div className="overflow-auto">
            {loadingUsers ? (
              <p className="text-gray-500">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className={`p-3 rounded-md border mb-2 cursor-pointer transition
                    ${selectedUser && selectedUser._id === user._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white hover:shadow'
                    }`}
                >
                  <p className="font-semibold">{user.name || 'No Name'}</p>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Stock */}
        <div className="border border-gray-300 rounded p-4 flex flex-col">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Stock for {selectedUser.name || selectedUser.email}
                </h2>
                <button
                  className="px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                  onClick={handleDeselectUser}
                >
                  Show All Stock
                </button>
              </div>

              {loadingStocks ? (
                <p className="text-gray-500">Loading stock...</p>
              ) : filteredStock.length === 0 ? (
                <p className="text-gray-500">
                  No stock entries for this user.
                </p>
              ) : (
                // Scrollable container for user’s stock
                <div className="overflow-auto max-h-96">
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full border">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left">Stock ID</th>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-left">Store</th>
                          <th className="px-4 py-2 text-left">User</th>
                          <th className="px-4 py-2 text-left">Qty</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStock.map((stockItem) => (
                          <tr
                            key={stockItem._id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {stockItem._id}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {stockItem.product?.name || 'No product'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {stockItem.store?.storeName || 'No store'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {typeof stockItem.user === 'object'
                                ? stockItem.user.name ||
                                stockItem.user.email ||
                                stockItem.user._id
                                : stockItem.user}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {stockItem.qty}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                className="bg-blue-500 text-white px-3 py-1 rounded-md"
                                onClick={() => openEditModal(stockItem)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">All Stock</h2>
              {loadingStocks ? (
                <p className="text-gray-500">Loading stock...</p>
              ) : stocks.length === 0 ? (
                <p className="text-gray-500">No stock entries found.</p>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full border">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Stock ID</th>
                        <th className="px-4 py-2 text-left">Product</th>
                        <th className="px-4 py-2 text-left">Store</th>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Qty</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((stockItem) => (
                        <tr
                          key={stockItem._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {stockItem._id}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {stockItem.product?.name || 'No product'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {stockItem.store?.storeName || 'No store'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {stockItem.user
                              ? typeof stockItem.user === 'object'
                                ? stockItem.user.name ||
                                stockItem.user.email ||
                                stockItem.user._id
                                : stockItem.user
                              : 'No user assigned'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {stockItem.qty}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              className="bg-blue-500 text-white px-3 py-1 rounded-md"
                              onClick={() => openEditModal(stockItem)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Stock Modal */}
      {isModalOpen && (
        <Modal
          title={`Edit Stock #${stockBeingEdited?._id ?? ''}`}
          onClose={closeModal}
        >
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Product: {stockBeingEdited?.product?.name || 'No product'} <br />
              Store: {stockBeingEdited?.store?.storeName || 'No store'} <br />
              User:{' '}
              {typeof stockBeingEdited?.user === 'object'
                ? stockBeingEdited.user.name ||
                stockBeingEdited.user.email ||
                stockBeingEdited.user._id
                : stockBeingEdited.user}
            </p>
            <label className="block mb-1 font-medium">Quantity</label>
            <input
              type="number"
              className="border rounded w-full px-3 py-2"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              min="0"
            />
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              className="bg-gray-300 hover:bg-gray-400 px-4 py-1 rounded"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
              onClick={handleSaveChanges}
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
