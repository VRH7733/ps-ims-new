import React from 'react';

const SortPopup = ({ isVisible, onClose, onSort }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-bold mb-4">Sort Products price</h3>
                <div className="mb-4">
                    <label className="block mb-1">Sort Order:</label>
                    <select
                        onChange={(e) => onSort(e.target.value)}
                        className="border rounded w-full py-2 px-3"
                    >
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onSort(document.querySelector('select').value)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SortPopup;