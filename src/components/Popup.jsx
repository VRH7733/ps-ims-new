import React from 'react';

const Popup = ({ isVisible, onClose, onSubmit, newProduct, handleInputChange }) => {
    if (!isVisible) return null;

    return (
    
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-80">
                <h3 className="text-md font-bold mb-3">New Order</h3>
                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Product Name:</label>
                        <input
                            type="text"
                            name="productName"
                            value={newProduct.productName}
                            onChange={handleInputChange}
                            placeholder="Enter product name"
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Product ID:</label>
                        <input
                            type="text"
                            name="productId"
                            value={newProduct.productId}
                            onChange={handleInputChange}
                            placeholder="Enter product ID"
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Category:</label>
                        <input
                            type="text"
                            name="category"
                            value={newProduct.category}
                            onChange={handleInputChange}
                            placeholder="Enter category"
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Order Value:</label>
                        <input
                            type="number"
                            name="orderValue"
                            value={newProduct.orderValue}
                            onChange={handleInputChange}
                            placeholder="Enter order value"
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Quantity:</label>
                        <input
                            type="number"
                            name="quantity"
                            value={newProduct.quantity}
                            onChange={handleInputChange}
                            placeholder="Enter quantity"
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Unit:</label>
                        <input
                            type="number"
                            name="unit"
                            value={newProduct.unit}
                            onChange={handleInputChange}
                            placeholder="Enter unit"
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Buying Price:</label>
                        <input
                            type="number"
                            name="buyingPrice"
                            value={newProduct.buyingPrice}
                            onChange={handleInputChange}
                            placeholder="Enter buying price"
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm mb-1">Delivery Date:</label>
                        <input
                            type="date"
                            name="deliveryDate"
                            value={newProduct.deliveryDate}
                            onChange={handleInputChange}
                            className="border rounded w-full py-1 px-2 text-sm"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                name="notifyOnDelivery"
                                checked={newProduct.notifyOnDelivery}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            Notify on delivery
                        </label>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-3xl mr-2 text-sm"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-3 py-1 rounded-3xl text-sm"
                        >
                            Add Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    
    );
};

export default Popup;