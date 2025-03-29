import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AddProductForm from './AddProductForm';
import SortPopup from './SortPopup';

const InventoryDashboard = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [categories, setCategories] = useState(new Set());
  const [showForm, setShowForm] = useState(false);

  // Sorting states
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('ascending');
  const [sortField, setSortField] = useState('buyingPrice');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // NEW: Search bar and date range filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/inventory');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      updateInventoryStats(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const updateInventoryStats = (data) => {
    setTotalProducts(data.length);
    const revenue = data.reduce(
      (acc, p) => acc + p.quantity * p.buyingPrice,
      0
    );
    setTotalRevenue(revenue);
    setLowStockCount(
      data.filter((p) => p.quantity > 0 && p.quantity <= p.thresholdValue).length
    );
    setCategories(new Set(data.map((p) => p.category)));
  };

  // POST: addProduct function
  const addProduct = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Do not set 'Content-Type' manually if you are uploading FormData
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      const newProduct = await response.json();
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      updateInventoryStats(updatedProducts);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Helper to determine stock status styling
  const getStatusColor = (quantity, thresholdValue) => {
    if (quantity === 0) return 'text-red-600';
    if (quantity <= thresholdValue) return 'text-yellow-400';
    return 'text-blue-500';
  };

  const getStockStatus = (quantity, thresholdValue) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= thresholdValue) return 'Low Stock';
    return 'In Stock';
  };

  // Download Inventory CSV
  const downloadCSV = (data) => {
    if (data.length === 0) {
      alert('No data available for download.');
      return;
    }
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map((header) => JSON.stringify(row[header] || ''));
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'inventory.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      const data = await response.json();
      downloadCSV(data);
    } catch (error) {
      console.error('Error downloading inventory data:', error);
    }
  };

  // Sorting function
  const handleSort = (order) => {
    setSortOrder(order);
    setIsSortVisible(false);
  };

  // 1) Filter (search + date range)
  // 2) Then sort
  // 3) Then paginate
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by search term (name or productId)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.productId.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by date range (on updatedAt)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((p) => {
        const updated = new Date(p.updatedAt);
        return updated >= start && updated <= end;
      });
    }

    return filtered;
  };

  // Sort after filtering
  const getSortedProducts = (filteredProducts) => {
    return [...filteredProducts].sort((a, b) => {
      if (sortOrder === 'ascending') {
        return a[sortField] - b[sortField];
      } else {
        return b[sortField] - a[sortField];
      }
    });
  };

  // Final array to render
  const filteredProducts = getFilteredProducts();
  const sortedProducts = getSortedProducts(filteredProducts);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col h-screen ml-[210px] xl:ml-[328px] p-1 bg-gray-50">
      {/* Overall Inventory Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-20">
        <h2 className="text-xl font-semibold mb-4">Overall Inventory</h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-blue-600">Categories</p>
            <p className="text-xl font-medium">{categories.size}</p>
          </div>
          <div className="text-center">
            <p className="text-orange-500">Total Products</p>
            <p className="text-xl font-medium">{totalProducts}</p>
          </div>
          <div className="text-center">
            <p className="text-green-500">Total Cost</p>
            <p className="text-xl font-medium">₹{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-red-500">Low Stocks</p>
            <p className="text-xl font-medium">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Products Table Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-3 overflow-x-scroll">
        {/* Search & Filters Row */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <h2 className="text-xl font-semibold">Products</h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search (Name or ID)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded"
            />

            {/* Date Range Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <label className="text-sm">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 border rounded"
              />
            </div>

            {/* Add Product Button */}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setShowForm(true)}
            >
              Add Product
            </button>

            {/* Filters (Sort) Popup Button */}
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
              onClick={() => setIsSortVisible(true)}
            >
              Filters
            </button>

            {/* Download CSV Button */}
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
              onClick={handleDownload}
            >
              Download All
            </button>
          </div>
        </div>

        {/* Sort Popup */}
        <SortPopup
          isVisible={isSortVisible}
          onClose={() => setIsSortVisible(false)}
          onSort={handleSort}
        />

        {/* Products Table */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="py-3 px-4 text-center border-b border-gray-300">Product Name</th>
              <th className="py-3 px-4 text-center border-b border-gray-300">Product ID</th>
              <th className="py-3 px-4 text-center border-b border-gray-300">Buying Price</th>
              <th className="py-3 px-4 text-center border-b border-gray-300">Quantity</th>
              <th className="py-3 px-4 text-center border-b border-gray-300">Expiry Date</th>
              <th className="py-3 px-4 text-center border-b border-gray-300">Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product._id}>
                <td className="py-3 px-4 text-center border-b border-gray-300">
                  <Link to={`/app/product-details/${product._id}`} className="hover:text-blue-600">
                    {product.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-center border-b border-gray-300">
                  {product.productId}
                </td>
                <td className="py-3 px-4 text-center border-b border-gray-300">
                  ₹{product.buyingPrice}
                </td>
                <td className="py-3 px-4 text-center border-b border-gray-300">
                  {product.quantity}
                </td>
                <td className="py-3 px-4 text-center border-b border-gray-300">
                  {product.expiryDate
                    ? new Date(product.expiryDate).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td
                  className={`py-3 px-4 text-center border-b border-gray-300 ${getStatusColor(
                    product.quantity,
                    product.thresholdValue
                  )}`}
                >
                  {getStockStatus(product.quantity, product.thresholdValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <AddProductForm
          onSubmit={addProduct}
          onDiscard={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default InventoryDashboard;
