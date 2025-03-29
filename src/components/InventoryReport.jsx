import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const SalesReport = () => {
    const [salesData, setSalesData] = useState([]); // State to store fetched sales data
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(11);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
    });
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [categories, setCategories] = useState([]); // State to store unique categories

    // Fetch sales data from the backend
    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/inventory');
                if (!response.ok) {
                    throw new Error('Failed to fetch sales data');
                }
                const data = await response.json();
                setSalesData(data);

                // Extract unique categories from the data
                const uniqueCategories = [...new Set(data.map((product) => product.category))];
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching sales data:', error);
            }
        };

        fetchSalesData();
    }, []);

    // Calculate current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Function to apply filters
    const applyFilters = (data) => {
        let filteredData = data;

        // Filter by date range
        if (filters.startDate && filters.endDate) {
            filteredData = filteredData.filter((product) => {
                const expiryDate = new Date(product.expiryDate);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                return expiryDate >= startDate && expiryDate <= endDate;
            });
        }

        // Filter by category (if applicable)
        if (filters.category) {
            filteredData = filteredData.filter((product) => product.category === filters.category);
        }

        return filteredData;
    };

    // Get filtered data
    const filteredData = applyFilters(salesData);
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Total pages for pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // Function to determine stock status color
    const getStatusColor = (quantity, thresholdValue) => {
        if (quantity <= thresholdValue) return 'text-red-500'; // Low stock
        return 'text-green-500'; // Sufficient stock
    };

    // Function to determine stock status text
    const getStockStatus = (quantity, thresholdValue) => {
        if (quantity <= thresholdValue) return 'Low Stock';
        return 'In Stock';
    };

    // Handle download functionality
    const handleDownload = () => {
        // Convert filteredData to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);

        // Create a new workbook and add the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Save the file
        saveAs(blob, 'sales_report.xlsx');
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    return (
        <div className="p-6 ml-[204px] xl:ml-[320px] mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Inventory Report</h2>
                    <div className="flex space-x-2">
                        {/* Filter Button */}
                        <button
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                            onClick={() => setIsFilterVisible(!isFilterVisible)}
                        >
                            Filters
                        </button>
                        {/* Download Button */}
                        <button
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                            onClick={handleDownload}
                        >
                            Download All
                        </button>
                    </div>
                </div>

                {/* Filter Popup Card */}
                {isFilterVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-md w-96">
                            <h3 className="text-lg font-semibold mb-4">Filter Options</h3>
                            {/* Category Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="mt-1 p-2 border rounded-lg w-full"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Date Range Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="mt-1 p-2 border rounded-lg w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="mt-1 p-2 border rounded-lg w-full"
                                />
                            </div>
                            {/* Apply and Close Buttons */}
                            <div className="flex justify-end space-x-2">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    onClick={() => setIsFilterVisible(false)}
                                >
                                    Apply
                                </button>
                                <button
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                                    onClick={() => setIsFilterVisible(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Product Name</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Product ID</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Category</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Buying Price</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Quantity</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Expiry Date</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Stock Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((product) => (
                                <tr key={product.id}>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">
                                        <span className="text-blue-600">{product.name}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{product.productId}</td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{product.category}</td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">₹{product.buyingPrice}</td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{product.quantity}</td>
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
                </div>

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
        </div>
    );
};

export default SalesReport;