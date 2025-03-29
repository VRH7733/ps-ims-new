// src/components/AddProductForm.jsx
import React, { useState, useEffect } from 'react';

const AddProductForm = ({ onSubmit, onDiscard }) => {
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [category, setCategory] = useState('');

  // cost/selling
  const [costPrice, setCostPrice] = useState('');
  const [buyingPrice, setbuyingPrice] = useState('');

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [thresholdValue, setThresholdValue] = useState('');

  const [productImg, setProductImg] = useState(null);
  const [availability, setAvailability] = useState(true);

  // store & supplier
  const [storeId, setStoreId] = useState('');
  const [supplierId, setSupplierId] = useState('');

  // For dropdown data
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // submitting form 
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Unit dropdown options
  const units = ['pcs', 'box', 'kg', 'ltr'];

  useEffect(() => {
    fetchStores();
    fetchSuppliers();
  }, []);

  const fetchStores = async () => {
    try {
      // e.g. GET /api/stores to fetch all
      const res = await fetch('http://localhost:8080/api/stores');
      if (!res.ok) throw new Error('Failed to fetch stores');
      const data = await res.json();
      setStores(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // e.g. GET /api/supplier/getAll or /api/suppliers
      const res = await fetch('http://localhost:8080/api/supplier/getAll');
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 250 * 1024) {
      alert('File size exceeds 250KB');
      setProductImg(null);
    } else {
      setProductImg(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true); // changed to work add product button

    const formData = new FormData();
    formData.append('name', name);
    formData.append('productId', productId);
    formData.append('category', category);
    formData.append('costPrice', parseFloat(costPrice));      // new
    formData.append('buyingPrice', parseFloat(buyingPrice)); // new
    formData.append('quantity', parseInt(quantity));
    formData.append('unit', unit);
    formData.append('expiryDate', expiryDate);
    formData.append('thresholdValue', parseInt(thresholdValue));

    if (productImg) {
      formData.append('productImg', productImg);
    }
    formData.append('availability', availability);

    formData.append('store', storeId);
    formData.append('supplier', supplierId);

    onSubmit(formData);
    setIsSubmitting(false);
    // Close the form after submission
    onDiscard();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-lg font-bold mb-4">Add Product</h3>
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Product Image</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              type="file"
              onChange={handleImageChange}
            />
          </div>

          {/* Product Name */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Name</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Product ID */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Product ID</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Category</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
              required
            />
          </div>

          {/* Cost Price */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Cost Price</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              type="number"
              placeholder="Enter cost price"
              required
            />
          </div>

          {/* Selling Price */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Selling Price</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={buyingPrice}
              onChange={(e) => setbuyingPrice(e.target.value)}
              type="number"
              placeholder="Enter selling price"
              required
            />
          </div>

          {/* Quantity */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Quantity</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              placeholder="Enter quantity"
              
            />
          </div>

          {/* Unit: dropdown */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Unit</label>
            <select
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            >
              <option value="">Select a unit</option>
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Expiry Date</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              type="date"
              required
            />
          </div>

          {/* Threshold Value */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Threshold</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={thresholdValue}
              onChange={(e) => setThresholdValue(e.target.value)}
              placeholder="Enter threshold value"
              type="number"
              required
            />
          </div>

          {/* Store dropdown */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Store</label>
            <select
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.storeName}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier dropdown */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Supplier</label>
            <select
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select a supplier</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.supplierName}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="mb-2 flex items-center">
            <label className="block text-gray-700 text-sm w-1/3">Availability</label>
            <input
              className="w-2/3 p-2 border border-gray-300 rounded text-sm"
              type="checkbox"
              checked={availability}
              onChange={(e) => setAvailability(e.target.checked)}
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm"
              type="button"
              onClick={onDiscard}
            >
              Discard
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
