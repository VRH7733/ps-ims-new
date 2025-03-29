import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const SalesReport = () => {
    const [salesData, setSalesData] = useState([]); // State to store fetched sales data
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [filters, setFilters] = useState({
        location: '',
        operatingHours: '',
    });
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [locations, setLocations] = useState([]); // State to store unique locations
    const [operatingHoursList, setOperatingHoursList] = useState([]); // State to store unique operating hours

    // Fetch sales data from the backend
    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/stores');
                if (!response.ok) {
                    throw new Error('Failed to fetch sales data');
                }
                const data = await response.json();
                setSalesData(data);

                // Extract unique locations and operating hours
                const uniqueLocations = [...new Set(data.map((store) => store.location))];
                const uniqueOperatingHours = [...new Set(data.map((store) => store.operatingHours))];

                setLocations(uniqueLocations);
                setOperatingHoursList(uniqueOperatingHours);
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

        // Filter by location
        if (filters.location) {
            filteredData = filteredData.filter((store) => store.location === filters.location);
        }

        // Filter by operating hours
        if (filters.operatingHours) {
            filteredData = filteredData.filter((store) => store.operatingHours === filters.operatingHours);
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

    // Handle download functionality
    const handleDownload = () => {
        // Convert filteredData to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);

        // Create a new workbook and add the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Stores Report');

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Save the file
        saveAs(blob, 'stores_report.xlsx');
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
                    <h2 className="text-xl font-semibold">Stores Report</h2>
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
                            {/* Location Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <select
                                    name="location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                    className="mt-1 p-2 border rounded-lg w-full"
                                >
                                    <option value="">All Locations</option>
                                    {locations.map((location, index) => (
                                        <option key={index} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Operating Hours Filter */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
                                <select
                                    name="operatingHours"
                                    value={filters.operatingHours}
                                    onChange={handleFilterChange}
                                    className="mt-1 p-2 border rounded-lg w-full"
                                >
                                    <option value="">All Operating Hours</option>
                                    {operatingHoursList.map((hours, index) => (
                                        <option key={index} value={hours}>
                                            {hours}
                                        </option>
                                    ))}
                                </select>
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
                                <th className="py-3 px-4 text-center border-b border-gray-300">Store Name</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Store ID</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Location</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Phone</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Email</th>
                                <th className="py-3 px-4 text-center border-b border-gray-300">Operating Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((store) => (
                                <tr key={store.id}>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">
                                        <span className="text-blue-600">{store.storeName}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{store._id}</td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{store.location}</td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{store.phone}</td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{store.email}</td>
                                    <td className="py-3 px-4 text-center border-b border-gray-300">{store.operatingHours}</td>
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