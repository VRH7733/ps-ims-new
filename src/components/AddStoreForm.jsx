// PS-IMS-NEW-FE/src/components/AddStoreForm.jsx
import React, { useState } from 'react';

const AddStoreForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        storeName: '',
        location: '',
        phone: '',
        email: '',
        operatingHours: '',
    });

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                throw new Error('Failed to create store');
            }
            const newStore = await res.json();
            onSuccess(newStore);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-lg font-semibold mb-4">Add New Store</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="block text-gray-700">Store Name</label>
                        <input
                            className="w-full p-2 border rounded"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700">Location</label>
                        <input
                            className="w-full p-2 border rounded"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700">Phone</label>
                        <input
                            className="w-full p-2 border rounded"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700">Email</label>
                        <input
                            className="w-full p-2 border rounded"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700">Operating Hours</label>
                        <input
                            className="w-full p-2 border rounded"
                            name="operatingHours"
                            value={formData.operatingHours}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                            Add Store
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStoreForm;
