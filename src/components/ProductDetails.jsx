import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit, FaDownload, FaSave } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams(); // product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 🔥 Edit mode toggle
  const [updatedProduct, setUpdatedProduct] = useState({}); // 🔥 Editable copy of product

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/inventory/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        setProduct(data);
        setUpdatedProduct(data); // Initialize editable fields
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="ml-[210px] mt-8">Loading product details...</p>;
  if (error) return <p className="ml-[210px] mt-8 text-red-500">{error}</p>;
  if (!product) return <p className="ml-[210px] mt-8">Product not found.</p>;

  // ✅ Handles input changes when in edit mode
  const handleInputChange = (e) => {
    setUpdatedProduct({
      ...updatedProduct,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Saves edited product to database
  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) throw new Error('Failed to update product');

      setProduct(updatedProduct);
      setIsEditing(false); // Exit edit mode
      alert('Product updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Downloads product details as CSV
  const handleDownload = () => {
    const csvRows = [
      ['Field', 'Value'],
      ['Product ID', product.productId],
      ['Category', product.category],
      ['Buying Price', product.buyingPrice],
      ['Quantity', `${product.quantity} ${product.unit}`],
      ['Expiry Date', product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'],
      ['Threshold Value', product.thresholdValue],
    ];

    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name}_Details.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-screen ml-[210px] xl:ml-[328px] p-1 bg-gray-50">
      <div className="bg-white p-3 rounded-lg shadow-lg mt-[5rem]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={updatedProduct.name}
                onChange={handleInputChange}
                className="border px-2 py-1 rounded w-full"
              />
            ) : (
              product.name
            )}
          </h2>
          <div className="flex space-x-4">
            {isEditing ? (
              <button onClick={handleSave} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg">
                <FaSave className="mr-2" /> Save
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-gray-200 rounded-lg">
                <FaEdit className="mr-2" /> Edit
              </button>
            )}
            <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-gray-200 rounded-lg">
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Primary Details */}
          <div className="col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Primary Details</h3>
              <div className="space-y-2">
                {['productId', 'category', 'buyingPrice', 'quantity', 'expiryDate', 'thresholdValue'].map((field) => (
                  <div key={field} className="flex justify-between">
                    <p className="text-gray-600 w-1/3">{field.replace(/([A-Z])/g, ' $1')}</p>
                    {isEditing ? (
                      <input
                        type={field === 'buyingPrice' || field === 'quantity' ? 'number' : 'text'}
                        name={field}
                        value={updatedProduct[field]}
                        onChange={handleInputChange}
                        className="border px-2 py-1 rounded w-2/3"
                      />
                    ) : (
                      <p className="pl-2 font-bold w-2/3">
                        {field === 'expiryDate' && product[field] ? new Date(product[field]).toLocaleDateString() : product[field]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Details */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">Supplier Details</h3>
              {product.supplier ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-gray-600 w-1/3">Supplier ID:</p>
                    <p className="font-bold w-2/3">{product.supplier._id}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600 w-1/3">Supplier Name:</p>
                    <p className="font-bold w-2/3">{product.supplier.supplierName}</p>
                  </div>
                </div>
              ) : (
                <p>No Supplier Assigned.</p>
              )}
            </div>
          </div>

          {/* Product Image */}
          <div className="col-span-1 w-44 ml-auto">
            <div className="bg-gray-100 p-3 rounded-lg">
              <img
                alt="Product Packaging"
                className="border-dashed border-2 border-gray-300 p-4"
                height="150"
                src={product.productImgUrl || 'https://via.placeholder.com/150?text=No+Image'}
                width="150"
              />
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <p className="text-gray-500">Opening Stock</p>
                  <p className="font-bold">40</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-gray-500">Available Stock</p>
                  <p className="font-bold">{product.quantity}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-gray-500">Sold Quantity</p>
                  <p className="font-bold">25</p>
                </div>
              </div>
            </div>
          </div>
        </div> {/* end grid */}
      </div>
    </div>
  );
};

export default ProductDetails;