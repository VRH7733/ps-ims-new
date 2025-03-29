import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

function Suppliers() {
    const [showForm, setShowForm] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [newSupplier, setNewSupplier] = useState({
        supplierName: '',
        email: '',
        contact: '',
        ProductName: '',
        category: '',
        BuyingPrice: '',
        Type: '',
        onTheWay: '',
    });

    const toggleNewSupplierForm = () => setShowForm(!showForm);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSupplier((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

    // ✅ Function to add a new supplier
    const addSupplier = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('supplierName', newSupplier.supplierName);
        formData.append('email', newSupplier.email);
        formData.append('contact', newSupplier.contact);
        formData.append('ProductName', newSupplier.ProductName);
        formData.append('category', newSupplier.category);
        formData.append('BuyingPrice', newSupplier.BuyingPrice);
        formData.append('Type', newSupplier.Type);
        formData.append('onTheWay', newSupplier.onTheWay);
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        try {
            const response = await fetch('http://localhost:8080/api/supplier/create', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to add supplier');
            }

            const data = await response.json();
            setSuppliers((prevSuppliers) => [...prevSuppliers, data]);
            setShowForm(false); // Close the form
            setNewSupplier({
                supplierName: '',
                email: '',
                contact: '',
                ProductName: '',
                category: '',
                BuyingPrice: '',
                Type: '',
                onTheWay: '',
            });
            setProfileImage(null); // Reset the image
        } catch (error) {
            console.error('Error adding supplier:', error);
            alert('Failed to add supplier. Please try again.');
        }
    };

    // ✅ Function to Download Supplier Data as CSV
    const handleDownload = () => {
        if (suppliers.length === 0) {
            alert("No supplier data available for download.");
            return;
        }

        const headers = [
            "Supplier Name", "Email", "Contact", "Product Name", "Category",
            "Buying Price", "Type", "On the Way", "Profile Image"
        ];

        const csvRows = [headers.join(",")];

        suppliers.forEach(supplier => {
            const values = [
                supplier.supplierName,
                supplier.email,
                supplier.contact,
                supplier.ProductName,
                supplier.category,
                supplier.BuyingPrice,
                supplier.Type,
                supplier.onTheWay ?? 0,
                supplier.profileImgUrl || "No Image"
            ].map(val => `"${val}"`);

            csvRows.push(values.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "Suppliers.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // ✅ Fetch Suppliers
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/supplier/getAll');
                if (!res.ok) throw new Error('Failed to fetch suppliers');
                const data = await res.json();
                setSuppliers(data);
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        };

        fetchSuppliers();
    }, []);

    // ✅ Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSuppliers = suppliers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(suppliers.length / itemsPerPage);

    return (
        <div className="flex flex-col h-screen ml-[210px] xl:ml-[328px] p-1 bg-gray-50">
            <div className="bg-white p-6 rounded-lg shadow-md mt-20 overflow-x-scroll">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Suppliers</h2>
                    <div className="flex space-x-2">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                            onClick={toggleNewSupplierForm}
                        >
                            Add Supplier
                        </button>
                        <button
                            className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg"
                            onClick={handleDownload}
                        >
                            Download
                        </button>
                    </div>
                </div>

                {/* Suppliers Table */}
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            {["Supplier Name", "Email", "Contact", "Product Name", "Category", "Buying Price", "Type", "On the Way", "Profile Image"]
                                .map((header, index) => (
                                    <th key={index} className="py-3 px-4 text-center border-b border-gray-300">
                                        {header}
                                    </th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentSuppliers.map((supplier) => (
                            <tr key={supplier._id}>
                                <td className="py-3 px-4 text-center border-b border-gray-300">{supplier.supplierName}</td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">{supplier.email}</td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">{supplier.contact}</td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">{supplier.ProductName}</td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">{supplier.category}</td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">{supplier.BuyingPrice}</td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">
                                    {supplier.Type === 'Taking Return' ? (
                                        <span className="text-green-500">{supplier.Type}</span>
                                    ) : (
                                        <span className="text-red-500">{supplier.Type}</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">{supplier.onTheWay ?? 0}</td>
                                <td className="py-3 px-4 text-center border-b border-gray-300">
                                    {supplier.profileImgUrl ? (
                                        <img
                                            src={supplier.profileImgUrl}
                                            alt="Profile"
                                            className="w-16 h-16 object-cover rounded-full mx-auto"
                                        />
                                    ) : (
                                        'No Image'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <p className="text-gray-700">Page {currentPage} of {totalPages}</p>
                    <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>

                {/* Modal for creating a new Supplier */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-8 rounded-lg shadow-md w-1/3">
                            <h2 className="text-xl font-semibold mb-6">New Supplier</h2>

                            <form onSubmit={addSupplier}>
                                {/* Profile Image Upload */}
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                        {profileImage ? (
                                            <img
                                                src={URL.createObjectURL(profileImage)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FontAwesomeIcon icon={faUser} className="text-gray-300 text-3xl" />
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <label className="text-blue-500 cursor-pointer">
                                            <span>Browse image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Supplier Name */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">Supplier Name</label>
                                    <input
                                        className="w-2/3 p-2 border rounded"
                                        name="supplierName"
                                        value={newSupplier.supplierName}
                                        onChange={handleInputChange}
                                        placeholder="Enter supplier name"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">Email</label>
                                    <input
                                        className="w-2/3 p-2 border rounded"
                                        name="email"
                                        type="email"
                                        value={newSupplier.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>

                                {/* Contact */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">Contact Number</label>
                                    <input
                                        className="w-2/3 p-2 border rounded"
                                        name="contact"
                                        value={newSupplier.contact}
                                        onChange={handleInputChange}
                                        placeholder="Enter contact number"
                                        type="tel"
                                        required
                                    />
                                </div>

                                {/* ProductName */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">Product Name</label>
                                    <input
                                        className="w-2/3 p-2 border rounded"
                                        name="ProductName"
                                        value={newSupplier.ProductName}
                                        onChange={handleInputChange}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">Category</label>
                                    <input
                                        className="w-2/3 p-2 border rounded"
                                        name="category"
                                        value={newSupplier.category}
                                        onChange={handleInputChange}
                                        placeholder="Enter category"
                                        required
                                    />
                                </div>

                                {/* BuyingPrice */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">Buying Price</label>
                                    <input
                                        className="w-2/3 p-2 border rounded"
                                        name="BuyingPrice"
                                        value={newSupplier.BuyingPrice}
                                        onChange={handleInputChange}
                                        placeholder="Enter price"
                                        type="number"
                                        required
                                    />
                                </div>

                                {/* Type */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">Type</label>
                                    <select
                                        className="w-2/3 p-2 border rounded"
                                        name="Type"
                                        value={newSupplier.Type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select type</option>
                                        <option value="Taking Return">Taking Return</option>
                                        <option value="Not Taking Return">Not Taking Return</option>
                                    </select>
                                </div>

                                {/* onTheWay */}
                                <div className="mb-4 flex items-center">
                                    <label className="block text-gray-700 w-1/3">On the Way</label>
                                    <input
                                        className="w-2/3 p-2 border rounded"
                                        name="onTheWay"
                                        value={newSupplier.onTheWay}
                                        onChange={handleInputChange}
                                        placeholder="On the way quantity"
                                        type="number"
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={toggleNewSupplierForm}
                                        className="bg-gray-600 text-white py-2 px-4 rounded-lg"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Add Supplier
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Suppliers;