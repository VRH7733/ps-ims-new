import { useEffect, useState } from 'react';
import { toWords } from 'number-to-words';

const Billing = () => {
    const [inventory, setInventory] = useState([]);
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Seller Information (Static)
    const sellerName = 'Seller Name';
    const sellerPhone = '1234567890';
    const sellerAddress = 'Seller Address';

    // Supplier Information (Static)
    const supplierName = 'Supplier Name';
    const supplierAddress = 'Supplier Address';

    // Customer Information (Editable)
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');

    // GST Rate
    const [gstRate, setGstRate] = useState(18); // Assuming 18% GST

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/inventory');
                const data = await response.json();
                setInventory(data);
                setFilteredInventory(data); // Initialize with all products
            } catch (error) {
                console.error('Error fetching inventory:', error);
            }
        };
        fetchInventory();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        const filtered = inventory.filter(product =>
            product.name.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredInventory(filtered);
        setShowDropdown(!!term); // Show dropdown only if there's a search term
    };

    const handleSelectProduct = (product) => {
        addToCart(product);
        setSearchTerm(''); // Clear search term after selection
        setShowDropdown(false); // Hide dropdown after selection
    };

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find(item => item._id === product._id);
            if (existingProduct) {
                return prevCart.map(item =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const updateQuantity = (productId, change) => {
        setCart((prevCart) => {
            return prevCart
                .map(item =>
                    item._id === productId
                        ? { ...item, quantity: Math.max(1, item.quantity + change) }
                        : item
                )
                .filter(item => item.quantity > 0);
        });
    };

    const deleteProduct = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item._id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.buyingPrice * item.quantity, 0).toFixed(2);
    };

    const calculateGst = () => {
        const total = parseFloat(calculateTotal());
        return total * (gstRate / 100);
    };

    const calculateTotalIncludingGst = () => {
        const total = parseFloat(calculateTotal());
        const gstAmount = calculateGst();
        return (total + gstAmount).toFixed(2);
    };

    const calculateTotalInWords = () => {
        const total = parseFloat(calculateTotalIncludingGst());
        return total > 0 ? toWords(total).toUpperCase() + ' RUPEES ONLY' : 'ZERO RUPEES ONLY';
    };

    const handlePaymentMethod = (method) => {
        setPaymentMethod(method);
    };

    const handleGenerateInvoice = async () => {
        const totalAmount = calculateTotalIncludingGst();
        const invoiceData = {
            cart,
            sellerName,
            sellerPhone,
            sellerAddress,
            supplierName,
            supplierAddress,
            customerName,
            customerPhone,
            customerAddress,
            totalAmount,
            paymentMethod,
        };

        // Open a new window immediately (user action)
        const pdfWindow = window.open('', '_blank');

        try {
            const response = await fetch('http://localhost:8080/api/invoices/generate-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData),
            });

            if (!response.ok) {
                throw new Error('Failed to generate invoice');
            }

            // Convert the response to a Blob
            const blob = await response.blob();

            // Create a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Update the popup window's URL with the PDF
            if (pdfWindow) {
                pdfWindow.location.href = url;
            } else {
                alert('Popup window was blocked. Please allow popups for this site.');
            }

            // Clean up the URL object
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating invoice:', error);
            alert('Failed to generate invoice');
        }
    };

    return (
        <div className="bg-gray-100 ml-[210px] xl:ml-[328px] p-1 pt-5 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Billing</h2>

                {/* Seller, Supplier, and Customer Details in Horizontal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Seller Card (Static) */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Seller Details</h3>
                        <p className="text-gray-600">{sellerName}</p>
                        <p className="text-gray-600">Phone: {sellerPhone}</p>
                        <p className="text-gray-600">{sellerAddress}</p>
                    </div>

                    {/* Supplier Card (Static) */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Supplier Details</h3>
                        <p className="text-gray-600">{supplierName}</p>
                        <p className="text-gray-600">{supplierAddress}</p>
                    </div>

                    {/* Customer Card (Editable) */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full mb-2 p-1 border rounded"
                            placeholder="Customer Name"
                        />
                        <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full mb-2 p-1 border rounded"
                            placeholder="Customer Phone"
                        />
                        <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full mb-2 p-1 border rounded"
                            placeholder="Customer Address"
                        />
                    </div>
                </div>

                {/* Search Bar with Dropdown */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="border rounded-lg px-3 py-2 w-60"
                    />
                    {showDropdown && (
                        <div className="absolute z-10 bg-white border rounded-lg mt-1 w-60 max-h-40 overflow-y-auto">
                            {filteredInventory.map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => handleSelectProduct(product)}
                                    className="cursor-pointer hover:bg-gray-100 px-3 py-2"
                                >
                                    {product.name} - ₹{product.buyingPrice}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Billing Table */}
                <div className="overflow-x-scroll">
                    <table className="w-full bg-white border rounded-lg">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-center">Product Name</th>
                                <th className="py-2 px-4 border-b text-center">Price</th>
                                <th className="py-2 px-4 border-b text-center">Quantity</th>
                                <th className="py-2 px-4 border-b text-center">Total</th>
                                <th className="py-2 px-4 border-b text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item) => (
                                <tr key={item._id}>
                                    <td className="py-2 px-4 border-b text-center">{item.name}</td>
                                    <td className="py-2 px-4 border-b text-center">₹{item.buyingPrice}</td>
                                    <td className="py-2 px-4 border-b text-center flex items-center justify-center">
                                        <button
                                            onClick={() => updateQuantity(item._id, -1)}
                                            className="bg-blue-600 text-white px-2 py-1 rounded-md mx-2"
                                        >
                                            -
                                        </button>
                                        {item.quantity}
                                        <button
                                            onClick={() => updateQuantity(item._id, 1)}
                                            className="bg-blue-600 text-white px-2 py-1 rounded-md mx-2"
                                        >
                                            +
                                        </button>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        ₹{(item.buyingPrice * item.quantity).toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button
                                            onClick={() => deleteProduct(item._id)}
                                            className="bg-blue-600 text-white px-2 py-1 rounded-md"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total Amount */}
                <div className="text-right mt-4 text-xl font-bold">
                    Total: ₹{calculateTotal()}
                </div>

                {/* Payment Options */}
                <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2">Select Payment Method:</h3>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={() => handlePaymentMethod('cash')}
                                className="mr-2"
                            />
                            Cash on Delivery
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="razorpay"
                                checked={paymentMethod === 'razorpay'}
                                onChange={() => handlePaymentMethod('razorpay')}
                                className="mr-2"
                            />
                            Pay with online
                        </label>
                    </div>
                </div>

                {/* Payment Button */}
                {paymentMethod && (
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={handleGenerateInvoice}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                        >
                            Generate Invoice
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Billing;